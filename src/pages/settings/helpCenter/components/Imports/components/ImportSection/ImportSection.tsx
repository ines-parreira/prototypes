import classNames from 'classnames'

import React, {ChangeEvent, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'

import {fromJS, Map} from 'immutable'
import {AxiosError} from 'axios'

import {notify} from '../../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../../state/notifications/types'

import Loader from '../../../../../../common/components/Loader/Loader'
import useAppDispatch from '../../../../../../../hooks/useAppDispatch'
import {getCurrentHelpCenter} from '../../../../../../../state/entities/helpCenters/selectors'

import {uploadFiles} from '../../../../../../../utils'

import {useHelpcenterApi} from '../../../../hooks/useHelpcenterApi'

import {saveFileAsDownloaded} from '../../../../../../../utils/file'

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

export const ImportSection = (): JSX.Element | null => {
    const [modalState, setModalState] = useState<ModalState | null>(null)
    const hiddenFileInputRef = useRef<HTMLInputElement>(null)
    const dispatch = useAppDispatch()
    const history = useHistory()
    const helpCenter = useSelector(getCurrentHelpCenter)
    const {isReady, client} = useHelpcenterApi()

    if (helpCenter === null || !isReady || client === undefined) {
        return null
    }

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
                        const errorMessage = (fromJS(error.response) as Map<
                            unknown,
                            unknown
                        >).getIn(
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

    return (
        <section>
            <h4>Import articles from another help center</h4>

            <p>
                You can import CSV files with your existing articles of another
                help center.
            </p>

            <Button onClick={() => setModalState({state: 'NO_FILE_SELECTED'})}>
                <i className="material-icons mr-2">cloud_upload</i>Import
                Articles
            </Button>

            <Modal isOpen={modalState !== null} onClose={closeModal} centered>
                <ModalHeader
                    toggle={
                        modalState?.state !== 'IMPORTING'
                            ? closeModal
                            : undefined
                    }
                >
                    Import articles from CSV
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
                                    Drop your CSV here, or{' '}
                                    <a
                                        href=""
                                        onClick={(ev) => {
                                            ev.preventDefault()
                                        }}
                                    >
                                        browse
                                    </a>
                                </div>
                            )}

                            <p className="m-0 mt-2">
                                <Link
                                    to="#"
                                    onClick={async (e) => {
                                        e.preventDefault()

                                        const response = await client.generateCsvTemplate(
                                            {
                                                help_center_id: helpCenter.id,
                                            }
                                        )

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
                <ModalFooter className={css.modalFooter}>
                    <Button
                        color="secondary"
                        disabled={modalState?.state === 'IMPORTING'}
                        onClick={closeModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        disabled={
                            modalState?.state !== 'FILE_SELECTED' ||
                            fileIsTooBig(modalState.file)
                        }
                        onClick={handleImport}
                    >
                        Import File
                    </Button>
                </ModalFooter>
            </Modal>
        </section>
    )
}

export default ImportSection
