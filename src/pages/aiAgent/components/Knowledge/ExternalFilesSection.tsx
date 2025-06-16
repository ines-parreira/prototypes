import React, { createRef, useEffect, useState } from 'react'

import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { Button, IconButton, Label, Tooltip } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import { ConfirmNavigationPrompt } from 'pages/common/components/ConfirmNavigationPrompt'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import { uploadAttachments } from 'rest_api/help_center_api/uploadAttachments'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './ExternalFilesSection.less'

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
    onLoadingStateChange?: (isLoading: boolean) => void
    onEmptyStateChange?: (isEmpty: boolean) => void
    disableNavigationPrompt?: boolean
}

export const ExternalFilesSection = ({
    helpCenterId,
    onLoadingStateChange,
    onEmptyStateChange,
    disableNavigationPrompt,
}: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = createRef<HTMLInputElement>()
    const dispatch = useAppDispatch()

    const { shopName } = useParams<{ shopName: string }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const history = useHistory()

    const isAiAgentFilesAndUrlsKnowledgeVisible = useFlag(
        FeatureFlagKey.AiAgentFilesAndUrlsKnowledgeVisibilityButton,
    )

    const { ingestFile, ingestedFiles, deleteIngestedFile, isIngesting } =
        useFileIngestion({
            helpCenterId,
            onSuccess: (file) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `File ${file.filename} uploaded successfully`,
                    }),
                )
            },
            onFailure: (file) => {
                const filename = file.filename.toLowerCase()
                const isMSOfficeFile =
                    filename.endsWith('.docx') || filename.endsWith('.pptx')

                const errorMessage =
                    'Failed to upload due to corrupted, incomplete, or mislabeled data. ' +
                    (isMSOfficeFile
                        ? 'Please try saving the file through Microsoft Office or converting it to PDF.'
                        : 'Please double-check the file or upload a different one.')

                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: errorMessage,
                    }),
                )
            },
        })

    const successfullyIngestedFiles =
        ingestedFiles
            ?.filter((ingestedFile) => ingestedFile.status === 'SUCCESSFUL')
            .sort((a, b) =>
                a.uploaded_datetime > b.uploaded_datetime ? 1 : -1,
            ) ?? []

    const isEmpty =
        ingestedFiles !== null ? successfullyIngestedFiles.length === 0 : null

    const maxFilesReached =
        successfullyIngestedFiles.length >= MAX_EXTERNAL_FILES

    const uploadFiles = async (files: File[]) => {
        if (files.length === 0) return

        if (
            files.length + successfullyIngestedFiles.length >
            MAX_EXTERNAL_FILES
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `You can only upload a maximum of ${MAX_EXTERNAL_FILES} files.`,
                }),
            )
            return
        }

        for (const file of files) {
            await uploadFile(file)
        }
    }

    const uploadFile = async (file: File) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `File too large. Upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`,
                }),
            )

            return
        }

        if (
            successfullyIngestedFiles.some(
                (ingestedFile) => ingestedFile.filename === file.name,
            )
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Failed to upload: A file with ${file.name} name already exists. Remove or select a different file.`,
                }),
            )

            return
        }

        setIsLoading(true)

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
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `An unknown error occurred while uploading file ${file.name}.`,
                }),
            )
        }
    }

    useEffect(() => {
        setIsLoading(isIngesting)
    }, [isIngesting])

    useEffect(() => {
        onLoadingStateChange && onLoadingStateChange(isLoading)
    }, [isLoading, onLoadingStateChange])

    useEffect(() => {
        if (isEmpty === null) return
        onEmptyStateChange && onEmptyStateChange(isEmpty)
    }, [isEmpty, onEmptyStateChange])

    const handleOpenArticles = (ingestedFile: any) => {
        history.push(routes.fileArticles(ingestedFile.id), {
            selectedResource: ingestedFile,
        })
    }

    const isExcelFile = (filename: string) =>
        filename.toLowerCase().endsWith('.xlsx')

    return (
        <>
            <ConfirmNavigationPrompt
                title="Upload still in progress"
                bodyText="Your document is still uploading. If you leave now, you'll lose any upload progress. Are you sure you want to leave this page?"
                cancelLabel="Continue Upload"
                confirmLabel="Discard Upload"
                enabled={isIngesting && !disableNavigationPrompt}
            />

            <div className={css.container}>
                <div>
                    <Label className={css.title}>Documents</Label>

                    <div className={css.description}>
                        Upload up to 10 documents for AI Agent to use as
                        knowledge. Avoid including personal or sensitive
                        information. Images within documents will not be
                        processed.
                    </div>
                </div>

                {successfullyIngestedFiles.length > 0 && (
                    <ul className={css.fileList}>
                        {successfullyIngestedFiles.map((ingestedFile) => (
                            <li
                                key={ingestedFile.id}
                                className={css.fileListItem}
                            >
                                <div className={css.fileListItemName}>
                                    {ingestedFile.filename}
                                </div>
                                <div>
                                    <IconButton
                                        size="small"
                                        fillStyle="ghost"
                                        intent="secondary"
                                        aria-label="Download ingested file"
                                        onClick={() =>
                                            window.open(
                                                ingestedFile.google_storage_url,
                                                '_blank',
                                                'noopener noreferrer',
                                            )
                                        }
                                        icon="download"
                                    />
                                </div>
                                <div>
                                    <ConfirmationPopover
                                        placement="bottom"
                                        buttonProps={{
                                            intent: 'destructive',
                                        }}
                                        confirmLabel="Delete"
                                        title="Delete External Document?"
                                        content={
                                            <p>
                                                {`Are you sure you want to delete this document? AI Agent won't be able to use this information anymore.`}
                                            </p>
                                        }
                                        onConfirm={async () => {
                                            try {
                                                await deleteIngestedFile(
                                                    ingestedFile.id,
                                                )

                                                void dispatch(
                                                    notify({
                                                        status: NotificationStatus.Success,
                                                        message:
                                                            'File deleted successfully',
                                                    }),
                                                )
                                            } catch {
                                                void dispatch(
                                                    notify({
                                                        status: NotificationStatus.Error,
                                                        message:
                                                            'An unknown error occurred while deleting the file',
                                                    }),
                                                )
                                            }
                                        }}
                                    >
                                        {({
                                            uid,
                                            elementRef,
                                            onDisplayConfirmation,
                                        }) => (
                                            <IconButton
                                                size="small"
                                                fillStyle="ghost"
                                                intent="destructive"
                                                onClick={onDisplayConfirmation}
                                                id={uid}
                                                ref={elementRef}
                                                aria-label="Delete external document"
                                                icon="close"
                                            />
                                        )}
                                    </ConfirmationPopover>
                                </div>
                                {isAiAgentFilesAndUrlsKnowledgeVisible && (
                                    <div className={css.articlesIcons}>
                                        <IconButton
                                            id={`open-articles-${ingestedFile.id}`}
                                            size="small"
                                            fillStyle="ghost"
                                            intent="secondary"
                                            aria-label="Open articles"
                                            onClick={() =>
                                                handleOpenArticles(ingestedFile)
                                            }
                                            icon="keyboard_arrow_right"
                                            isDisabled={isExcelFile(
                                                ingestedFile.filename,
                                            )}
                                        />
                                        {isExcelFile(ingestedFile.filename) && (
                                            <Tooltip
                                                target={`open-articles-${ingestedFile.id}`}
                                                placement="top-start"
                                            >
                                                Viewing content from .xlsx files
                                                is not supported. Download to
                                                view its content.
                                            </Tooltip>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <div>
                    <input
                        ref={inputRef}
                        accept={SUPPORTED_TYPES.map(
                            (supportedType) => supportedType.type,
                        ).join(',')}
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                        ) => {
                            if (!event.target.files?.length) return
                            const files = Array.from(event.target.files)
                            void uploadFiles(files)
                            event.target.value = ''
                        }}
                    />

                    {maxFilesReached && (
                        <Tooltip target="upload-button">
                            You have reached the maximum number of documents
                            allowed
                        </Tooltip>
                    )}

                    <Button
                        id="upload-button"
                        intent="secondary"
                        onClick={() => inputRef.current?.click()}
                        isLoading={isLoading}
                        isDisabled={isLoading || maxFilesReached}
                        leadingIcon="cloud_upload"
                    >
                        {!isLoading ? 'Upload Files' : 'Uploading...'}
                    </Button>

                    <div className={css.buttonInfo}>
                        Supported types:{' '}
                        {SUPPORTED_TYPES.map(
                            (supportedType) => supportedType.ext,
                        ).join(', ')}
                        . Max {MAX_FILE_SIZE_MB} MB.
                    </div>
                </div>
            </div>
        </>
    )
}
