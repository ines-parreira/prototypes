import React, {ChangeEvent, useRef} from 'react'
import {Link, useHistory} from 'react-router-dom'

import {AxiosError} from 'axios'
import {fromJS, Map} from 'immutable'

import Loader from 'pages/common/components/Loader/Loader'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import Button from 'pages/common/components/button/Button'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'

import useAppDispatch from 'hooks/useAppDispatch'

import {uploadFiles} from 'utils'
import {saveFileAsDownloaded} from 'utils/file'

import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import {FetchedProvidersState, ImportArticlesModalState} from '../../types'

import {buildCsvColumnMatchingUrl, fileIsTooBig} from './utils'

import FileSelectedArea from './components/FileSelectedArea'
import DropAreas from './components/DropAreas'

import css from './ImportArticlesModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void

    modalState: ImportArticlesModalState | null
    onFileSelect: (file: File) => void
    onFileRemove: () => void
    onImportStart: () => void

    fetchedProviders: FetchedProvidersState

    isMigrationAvailable: boolean
    onMigrationDropAreaClick: () => void
}

const ImportArticlesModal: React.FC<Props> = ({
    isOpen,
    onClose,

    modalState,
    onFileSelect,
    onFileRemove,
    onImportStart,

    fetchedProviders,

    isMigrationAvailable,
    onMigrationDropAreaClick,
}) => {
    const history = useHistory()

    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()
    const {client} = useHelpCenterApi()

    const hiddenFileInputRef = useRef<HTMLInputElement>(null)

    if (!client) {
        return null
    }

    const handleImport = () => {
        if (modalState?.state === 'FILE_SELECTED') {
            const file = modalState.file

            onImportStart()

            uploadFiles([file]).then(
                (files) => {
                    // only one file was uploaded
                    const fileUrl = files[0].url

                    history.push(
                        buildCsvColumnMatchingUrl(helpCenter.id, fileUrl)
                    )
                },
                (error: AxiosError) => {
                    onFileRemove()

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
            onFileSelect(file)
        } else {
            void dispatch(
                notify({
                    message: 'The file you dropped is not in CSV format',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    const handleFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null) {
            onFileSelect(event.target.files[0])
        }
    }

    const shouldShowModalFooter =
        modalState?.state === 'FILE_SELECTED' && !fileIsTooBig(modalState?.file)

    return (
        <Modal size="large" isOpen={isOpen} onClose={onClose}>
            <ModalHeader title="Import articles" />
            <ModalBody>
                {modalState?.state === 'IMPORTING' ? (
                    <Loader minHeight="100px" />
                ) : (
                    <div>
                        <input
                            data-testid="import-articles-modal-file-upload"
                            type="file"
                            accept=".csv"
                            ref={hiddenFileInputRef}
                            style={{display: 'none'}}
                            onChange={handleFileChosen}
                        />

                        {modalState?.state === 'FILE_SELECTED' ? (
                            <FileSelectedArea
                                file={modalState.file}
                                onChangeFileClick={openFileDialog}
                            />
                        ) : (
                            <DropAreas
                                isMigrationAvailable={isMigrationAvailable}
                                fetchedProviders={fetchedProviders}
                                onFileDrop={handleFileDropped}
                                onUploadCSVClick={openFileDialog}
                                onMigrationDropAreaClick={
                                    onMigrationDropAreaClick
                                }
                            />
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
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport}>Import File</Button>
                </ModalFooter>
            )}
        </Modal>
    )
}

export default ImportArticlesModal
