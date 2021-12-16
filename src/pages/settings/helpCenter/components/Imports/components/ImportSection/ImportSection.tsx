import classNames from 'classnames'
import React, {ChangeEvent, useRef, useState, useEffect} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Spinner,
} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import {fromJS, Map} from 'immutable'
import {AxiosError} from 'axios'

import zendeskLogo from 'assets/img/integrations/zendesk.png'
import helpdocsLogo from 'assets/img/integrations/helpdocs.png'

import {notify} from '../../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../../state/notifications/types'
import Loader from '../../../../../../common/components/Loader/Loader'
import useAppDispatch from '../../../../../../../hooks/useAppDispatch'
import {helpCenterUpdated} from '../../../../../../../state/entities/helpCenters/actions'
import {uploadFiles} from '../../../../../../../utils'
import {useHelpCenterApi} from '../../../../hooks/useHelpCenterApi'
import {useCurrentHelpCenter} from '../../../../providers/CurrentHelpCenter'
import {saveFileAsDownloaded} from '../../../../../../../utils/file'
import {HOTSWAP_SDK_URL} from '../../../../../../../config'

import css from './ImportSection.less'
import {
    buildCsvColumnMatchingUrl,
    fileIsTooBig,
    MAXIMUM_FILE_SIZE_MB,
} from './utils'

interface ModalStateNoFileSelected {
    state: 'NO_FILE_SELECTED'
}

interface ModalStateFileSelected {
    state: 'FILE_SELECTED'
    file: File
}

interface ModalStateImporting {
    state: 'IMPORTING'
}

type ModalState =
    | ModalStateNoFileSelected
    | ModalStateFileSelected
    | ModalStateImporting

type Props = {
    className?: string
}

export const ImportSection: React.FC<Props> = ({className}: Props) => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const helpCenter = useCurrentHelpCenter()
    const {client} = useHelpCenterApi()
    const [modalState, setModalState] = useState<ModalState | null>(null)
    const hiddenFileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (document.querySelector(`script[src="${HOTSWAP_SDK_URL}"]`)) {
            return
        }

        const script = document.createElement('script')
        script.src = HOTSWAP_SDK_URL
        document.head.appendChild(script)
    }, [])

    const [
        {
            value: hotswapImportProgressState,
            loading: isHotswapImportProgressRequestLoading,
        },
        updateHotswapImportProgressState,
    ] = useAsyncFn(async () => {
        if (!helpCenter.hotswap_session_token || !client) {
            return
        }

        const response = await client.getHotswapStatus(helpCenter.id)
        return response.data.progress
    }, [client, helpCenter.hotswap_session_token])

    useEffect(() => {
        if (helpCenter.hotswap_session_token) {
            void updateHotswapImportProgressState()
        }
    }, [helpCenter.hotswap_session_token])

    if (!client) {
        return null
    }

    const isHotswapImportInProgress =
        hotswapImportProgressState === 'IN_PROGRESS'

    const handleImport = () => {
        if (modalState?.state === 'FILE_SELECTED') {
            const file = modalState.file

            setModalState({
                state: 'IMPORTING',
            })

            uploadFiles([file]).then(
                (files) => {
                    // only one file was uploaded
                    const fileUrl = files[0].url

                    history.push(
                        buildCsvColumnMatchingUrl(helpCenter.id, fileUrl)
                    )
                },
                (error: AxiosError) => {
                    setModalState({
                        state: 'NO_FILE_SELECTED',
                    })

                    if (error.response?.status === 413) {
                        void dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                // in development, the limit is lower than 10MB (1MB) but it is not user-facing
                                message:
                                    'Failed to upload file because its size is bigger than 10MB. Try to split it into several smaller files.',
                            })
                        )
                    } else {
                        const errorMessage = (
                            fromJS(error.response) as Map<unknown, unknown>
                        ).getIn(
                            ['data', 'error', 'msg'],
                            'Failed to upload file. Please try again later.'
                        )

                        void dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                message: errorMessage,
                            })
                        )
                    }
                }
            )
        }
    }

    const openFileDialog = () => {
        hiddenFileInputRef.current?.click()
    }

    const handleFileDropped = (event: React.DragEvent) => {
        event.preventDefault()

        // only one file can be imported at a time
        const file = event.dataTransfer.items[0].getAsFile()

        if (file !== null && file.name.toLocaleLowerCase().endsWith('.csv')) {
            setModalState({
                state: 'FILE_SELECTED',
                file,
            })
        }
    }

    const handleFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null) {
            setModalState({
                state: 'FILE_SELECTED',
                file: event.target.files[0],
            })
        }
    }

    const closeModal = () => setModalState(null)

    const shouldShowModalFooter =
        modalState?.state === 'FILE_SELECTED' && !fileIsTooBig(modalState?.file)

    const handleAnotherProviderImportClick = async () => {
        if (!window.Hotswap) {
            return
        }

        closeModal()

        let token = helpCenter.hotswap_session_token
        if (!token) {
            const {data} = await client.createHotswapSessionToken(helpCenter.id)
            token = data.token
            dispatch(
                helpCenterUpdated({
                    ...helpCenter,
                    hotswap_session_token: token,
                })
            )
        }

        window
            .Hotswap({
                token,
                onClose: () => {
                    void updateHotswapImportProgressState()
                },
            })
            .open()
    }

    const handleMoreDetailsClick = () => {
        if (!window.Hotswap || !helpCenter.hotswap_session_token) {
            return
        }

        window
            .Hotswap({
                token: helpCenter.hotswap_session_token,
                onClose: () => {
                    void updateHotswapImportProgressState()
                },
            })
            .open()
    }

    return (
        <section className={className}>
            <h4>Import articles from another Help Center</h4>

            <p>
                You can import your existing articles from{' '}
                <strong>other supported help center solutions</strong> or by
                uploading a CSV.
            </p>

            {isHotswapImportInProgress && (
                <div className={css.importInProgressContainer}>
                    <div>
                        <Spinner
                            size="sm"
                            color="primary"
                            className={css.spinner}
                        />
                        Import in progress
                    </div>

                    <span
                        onClick={handleMoreDetailsClick}
                        className={css.moreDetails}
                    >
                        More Details
                    </span>
                </div>
            )}

            {!isHotswapImportInProgress && (
                <Button
                    disabled={isHotswapImportProgressRequestLoading}
                    onClick={() => setModalState({state: 'NO_FILE_SELECTED'})}
                >
                    <i className="material-icons mr-2">cloud_upload</i>Import
                    Articles
                </Button>
            )}

            <Modal
                size="lg"
                isOpen={modalState !== null}
                onClose={closeModal}
                centered
            >
                <ModalHeader
                    toggle={
                        modalState?.state !== 'IMPORTING'
                            ? closeModal
                            : undefined
                    }
                >
                    Import articles
                </ModalHeader>
                <ModalBody>
                    {modalState?.state === 'IMPORTING' ? (
                        <Loader minHeight="100px" />
                    ) : (
                        <div>
                            <input
                                type="file"
                                accept=".csv"
                                ref={hiddenFileInputRef}
                                style={{display: 'none'}}
                                onChange={handleFileChosen}
                            />

                            {modalState?.state === 'FILE_SELECTED' ? (
                                <div>
                                    <div className={css.fileSelectedArea}>
                                        <div>
                                            <i className="material-icons mr-2">
                                                insert_drive_file
                                            </i>
                                            {modalState.file.name}
                                        </div>

                                        <div>
                                            <Button
                                                color="secondary"
                                                size="sm"
                                                onClick={openFileDialog}
                                            >
                                                Change File
                                            </Button>
                                        </div>
                                    </div>

                                    {fileIsTooBig(modalState.file) ? (
                                        <div className="text-danger">
                                            The size of your file is over{' '}
                                            {MAXIMUM_FILE_SIZE_MB}MB, please
                                            select another file.
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className={css.dropAreasContainer}>
                                    <div
                                        className={css.fileDropArea}
                                        onClick={openFileDialog}
                                        onDrop={handleFileDropped}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <i
                                            className={classNames(
                                                'material-icons',
                                                css.modalCloudIcon
                                            )}
                                        >
                                            cloud_upload
                                        </i>

                                        <b className={css.dropAreaText}>
                                            Drop your CSV here, or{' '}
                                            <a
                                                href=""
                                                onClick={(ev) => {
                                                    ev.preventDefault()
                                                }}
                                            >
                                                browse
                                            </a>
                                        </b>
                                    </div>
                                    <div
                                        className={css.fileDropArea}
                                        onClick={
                                            handleAnotherProviderImportClick
                                        }
                                    >
                                        <span
                                            className={
                                                css.supportedProvidersText
                                            }
                                        >
                                            Currently supported providers:
                                        </span>
                                        <div
                                            className={
                                                css.providersLogosContainer
                                            }
                                        >
                                            <img
                                                src={helpdocsLogo}
                                                alt="Helpdocs"
                                                className={css.providerLogo}
                                            />
                                            <img
                                                src={zendeskLogo}
                                                alt="Zendesk"
                                                className={css.providerLogo}
                                            />
                                        </div>
                                        <b className={css.dropAreaText}>
                                            Import from another provider
                                        </b>
                                    </div>
                                </div>
                            )}

                            <p className="m-0 mt-2">
                                <Link
                                    to="#"
                                    onClick={async (e) => {
                                        e.preventDefault()

                                        const response =
                                            await client.generateCsvTemplate({
                                                help_center_id: helpCenter.id,
                                            })

                                        saveFileAsDownloaded(
                                            'template.csv',
                                            response.data,
                                            'text/csv'
                                        )
                                    }}
                                >
                                    Download this CSV template
                                </Link>{' '}
                                to automatically match fields.
                            </p>
                        </div>
                    )}
                </ModalBody>
                {shouldShowModalFooter && (
                    <ModalFooter className={css.modalFooter}>
                        <Button color="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={handleImport}>
                            Import File
                        </Button>
                    </ModalFooter>
                )}
            </Modal>
        </section>
    )
}

export default ImportSection
