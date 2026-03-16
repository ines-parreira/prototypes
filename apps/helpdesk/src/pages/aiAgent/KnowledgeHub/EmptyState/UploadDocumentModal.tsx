import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import classNames from 'classnames'

import { Box, Button, Icon, Modal, OverlayHeader, Text } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import { uploadAttachments } from 'rest_api/help_center_api/uploadAttachments'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { PAGE_NAME } from '../../AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from '../../AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import { FILE_UPLOAD_STARTED, OPEN_UPLOAD_DOCUMENT_MODAL } from '../constants'
import { dispatchDocumentEvent, useListenToDocumentEvent } from './utils'

import css from './UploadDocumentModal.less'

const MAX_FILE_SIZE_MB = 50
const MAX_EXTERNAL_FILES = 10

const SUPPORTED_TYPES = [
    { ext: '.pdf', type: 'application/pdf' },
    {
        ext: '.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
        ext: '.pptx',
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
    {
        ext: '.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
]

type Props = {
    helpCenterId: number
    shopName: string
}

export const UploadDocumentModal = ({ helpCenterId, shopName }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isDragActive, setIsDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const dispatch = useAppDispatch()

    const { ingestFile, ingestedFiles } = useFileIngestion({
        helpCenterId,
    })

    const { resetBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName: PAGE_NAME.FILE,
    })

    const successfullyIngestedFiles = useMemo(
        () =>
            ingestedFiles
                ?.filter((ingestedFile) => ingestedFile.status === 'SUCCESSFUL')
                .sort((a, b) =>
                    a.uploaded_datetime > b.uploaded_datetime ? 1 : -1,
                ) ?? [],
        [ingestedFiles],
    )

    const openModal = useCallback(() => {
        setIsOpen(true)
        setSelectedFiles([])
    }, [])

    const handleClose = useCallback(() => {
        setIsOpen(false)
        setSelectedFiles([])
    }, [])

    useListenToDocumentEvent(OPEN_UPLOAD_DOCUMENT_MODAL, openModal)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        setSelectedFiles(files)
    }

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragActive(true)
        }
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // Set dropEffect to indicate this is a copy operation
        e.dataTransfer.dropEffect = 'copy'
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // Only set inactive if we're leaving the drop zone, not a child element
        if (e.currentTarget === e.target) {
            setIsDragActive(false)
        }
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragActive(false)

            const droppedFiles = Array.from(e.dataTransfer.files)

            // Filter files by accepted types
            const acceptedExtensions = SUPPORTED_TYPES.map((t) => t.ext)
            const validFiles = droppedFiles.filter((file) => {
                const fileExtension =
                    '.' + file.name.split('.').pop()?.toLowerCase()
                return acceptedExtensions.includes(fileExtension)
            })

            if (validFiles.length < droppedFiles.length) {
                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Some files were rejected. Only ${acceptedExtensions.join(', ')} files are supported.`,
                        showDismissButton: true,
                    }),
                )
            }

            if (validFiles.length > 0) {
                setSelectedFiles(validFiles)
            }
        },
        [dispatch],
    )

    const uploadFile = useCallback(
        async (file: File) => {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `File too large. Upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`,
                        showDismissButton: true,
                    }),
                )
                return
            }

            if (
                successfullyIngestedFiles.some(
                    (ingestedFile) => ingestedFile.filename === file.name,
                )
            ) {
                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Failed to upload: A file with ${file.name} name already exists. Remove or select a different file.`,
                        showDismissButton: true,
                    }),
                )
                return
            }

            try {
                const uploadedFile = await uploadAttachments([file], {
                    id: helpCenterId,
                    type: 'HC',
                }).then((response) => response[0])

                await ingestFile({
                    filename: uploadedFile.name,
                    type: uploadedFile.content_type,
                    size_bytes: uploadedFile.size,
                    google_storage_url: uploadedFile.google_storage_key,
                })
            } catch {
                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `An unknown error occurred while uploading file ${file.name}.`,
                        showDismissButton: true,
                    }),
                )
            }
        },
        [dispatch, helpCenterId, ingestFile, successfullyIngestedFiles],
    )

    const validateAndUploadFiles = useCallback(async () => {
        if (selectedFiles.length === 0) return

        if (
            selectedFiles.length + successfullyIngestedFiles.length >
            MAX_EXTERNAL_FILES
        ) {
            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `You can only upload a maximum of ${MAX_EXTERNAL_FILES} files.`,
                    showDismissButton: true,
                }),
            )
            return
        }

        // Save files to local variable before clearing state
        const filesToUpload = [...selectedFiles]

        // Dispatch event to show banner immediately
        dispatchDocumentEvent(FILE_UPLOAD_STARTED, {
            fileCount: filesToUpload.length,
        })

        // Upload all files in background
        const fileUploadFinished = true
        setIsLoading(true)
        for (const file of filesToUpload) {
            if (fileUploadFinished) {
                await uploadFile(file)
            }
        }
        setSelectedFiles([])
        setIsLoading(false)
        setIsOpen(false)
        setIsDragActive(false)
        resetBanner()
    }, [
        selectedFiles,
        dispatch,
        resetBanner,
        uploadFile,
        successfullyIngestedFiles.length,
    ])

    useEffect(() => {
        if (selectedFiles.length > 0 && !isLoading) {
            void validateAndUploadFiles()
        }
    }, [selectedFiles, validateAndUploadFiles, isLoading])

    // Prevent default drag behavior globally when modal is open
    useEffect(() => {
        if (!isOpen) return

        const preventDefaults = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
        }

        window.addEventListener('dragover', preventDefaults)
        window.addEventListener('drop', preventDefaults)

        return () => {
            window.removeEventListener('dragover', preventDefaults)
            window.removeEventListener('drop', preventDefaults)
        }
    }, [isOpen])

    const acceptedTypes = SUPPORTED_TYPES.map((t) => t.ext).join(',')

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleClose}
            size="sm"
            aria-label="Upload documents"
        >
            <OverlayHeader title="Upload documents" />
            <div
                data-testid="upload-drop-zone"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Box flexDirection="column" gap="md">
                    <Box
                        flexDirection="column"
                        gap="xxs"
                        className={classNames({
                            [css.disablePointerEvents]: isDragActive,
                        })}
                    >
                        <Text>
                            Avoid including personal or sensitive information.
                            Images in documents are not supported and will not
                            be processed.
                        </Text>
                    </Box>
                    <Box flexDirection="column" gap="md">
                        <Box
                            flexDirection="column"
                            gap="md"
                            alignItems="center"
                            justifyContent="center"
                            className={css.uploadArea}
                        >
                            <Box
                                flexDirection="column"
                                justifyContent="center"
                                alignItems="center"
                                gap="xxs"
                            >
                                <Box gap="xs" alignItems="center">
                                    <Icon name="cloud-upload" size="lg" />
                                    <Text variant="bold">Drop your file</Text>
                                </Box>
                                <Text>or</Text>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    multiple
                                    accept={acceptedTypes}
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <Button
                                    variant="primary"
                                    onClick={() => inputRef.current?.click()}
                                >
                                    Select files
                                </Button>
                            </Box>
                            <Text
                                color="content-neutral-secondary"
                                align="center"
                                className={css.supportedFiles}
                            >
                                Supported file types: <br /> .pdf, .docx, .pptx,
                                and .xlsx up to 50 MB.
                            </Text>
                        </Box>

                        <Box
                            flexDirection="row"
                            gap="sm"
                            justifyContent="flex-end"
                        >
                            <Button variant="tertiary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={validateAndUploadFiles}
                                isDisabled={selectedFiles.length === 0}
                                isLoading={isLoading}
                                leadingSlot="cloud-upload"
                            >
                                Upload
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </div>
        </Modal>
    )
}

export const openUploadDocumentModal = () => {
    dispatchDocumentEvent(OPEN_UPLOAD_DOCUMENT_MODAL)
}
