import type React from 'react'
import { useRef } from 'react'

import { saveFileAsDownloaded } from '@repo/utils'
import type { AxiosError } from 'axios'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { useHistory } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { UploadType } from 'common/types'
import { uploadFiles } from 'common/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import Loader from 'pages/common/components/Loader/Loader'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type {
    FetchedProvidersState,
    ImportArticlesModalState,
} from '../../types'
import DropAreas from './components/DropAreas'
import FileSelectedArea from './components/FileSelectedArea'
import {
    buildCsvColumnMatchingUrl,
    fileIsTooBig,
    generateCSVTemplate,
} from './utils'

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
    const { client } = useHelpCenterApi()

    const hiddenFileInputRef = useRef<HTMLInputElement>(null)

    if (!client) {
        return null
    }

    const handleImport = () => {
        if (modalState?.state === 'FILE_SELECTED') {
            const file = modalState.file

            onImportStart()

            uploadFiles([file], { type: UploadType.PublicAttachment }).then(
                (files) => {
                    // only one file was uploaded
                    const fileUrl = files[0].url

                    history.push(
                        buildCsvColumnMatchingUrl(helpCenter.id, fileUrl),
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
                            }),
                        )
                    } else {
                        const errorMessage = (
                            fromJS(error.response) as Map<unknown, unknown>
                        ).getIn(
                            ['data', 'error', 'msg'],
                            'Failed to upload file. Please try again later.',
                        )

                        void dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                message: errorMessage,
                            }),
                        )
                    }
                },
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
                }),
            )
        }
    }

    const handleFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null) {
            onFileSelect(event.target.files[0])
        }
    }

    const handleDownloadClick = (event: React.MouseEvent) => {
        event.preventDefault()
        const templateContent = generateCSVTemplate()
        saveFileAsDownloaded('template.csv', templateContent, 'text/csv')
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
                            style={{ display: 'none' }}
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
                            <a href="#" onClick={handleDownloadClick}>
                                Download this CSV template
                            </a>{' '}
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
