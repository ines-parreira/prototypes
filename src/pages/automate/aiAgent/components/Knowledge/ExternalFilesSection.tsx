import {Label, Tooltip} from '@gorgias/merchant-ui-kit'
import React, {createRef, useEffect, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {useFileIngestion} from 'pages/automate/aiAgent/hooks/useFileIngestion'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'
import {ConfirmNavigationPrompt} from 'pages/common/components/ConfirmNavigationPrompt'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {uploadAttachments} from 'rest_api/help_center_api/uploadAttachments'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import css from './ExternalFilesSection.less'

const MAX_FILE_SIZE_MB = 500

const MAX_EXTERNAL_FILES = 10

const SUPPORTED_TYPES = [
    {ext: '.pdf', type: 'application/pdf'},
    {
        ext: '.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
        ext: '.pptx',
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
]

type Props = {
    helpCenterId: number
    onLoadingStateChange?: (isLoading: boolean) => void
    onEmptyStateChange?: (isEmpty: boolean) => void
}

export const ExternalFilesSection = ({
    helpCenterId,
    onLoadingStateChange,
    onEmptyStateChange,
}: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = createRef<HTMLInputElement>()
    const dispatch = useAppDispatch()

    const {ingestFile, ingestedFiles, deleteIngestedFile, isIngesting} =
        useFileIngestion({
            helpCenterId,
            onSuccess: () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'File uploaded successfully',
                    })
                )
            },
            onFailure: () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Failed to upload to due to corrupted, incomplete, or mislabeled data. Please double-check the file or upload a different one.',
                    })
                )
            },
        })

    const successfullyIngestedFiles =
        ingestedFiles
            ?.filter((ingestedFile) => ingestedFile.status === 'SUCCESSFUL')
            .sort((a, b) =>
                a.uploaded_datetime > b.uploaded_datetime ? 1 : -1
            ) ?? []

    const isEmpty = successfullyIngestedFiles.length === 0

    const maxFilesReached =
        successfullyIngestedFiles.length >= MAX_EXTERNAL_FILES

    const uploadFile = async (file: File) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `File too large. Upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`,
                })
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
                type: uploadedFile.type,
                size_bytes: uploadedFile.size,
                google_storage_url: uploadedFile.url,
            })
        } catch (e) {
            setIsLoading(false)

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `An unknown error occurred`,
                })
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
        onEmptyStateChange && onEmptyStateChange(isEmpty)
    }, [isEmpty, onEmptyStateChange])

    return (
        <>
            <ConfirmNavigationPrompt
                title="Upload still in progress"
                bodyText="Your document is still uploading. If you leave now, you'll lose any upload progress. Are you sure you want to leave this page?"
                cancelLabel="Continue Upload"
                confirmLabel="Discard Upload"
                enabled={isIngesting}
            />

            <div className={css.container}>
                <div>
                    <Label className={css.title}>External documents</Label>

                    <div>
                        Upload knowledge and process documents for AI Agent to
                        reference. Do not upload files that may contain any
                        sensitive or personal information. Images will be
                        ignored.
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
                                        aria-label="Open public URL"
                                        onClick={() =>
                                            window.open(
                                                ingestedFile.google_storage_url,
                                                '_blank',
                                                'noopener noreferrer'
                                            )
                                        }
                                    >
                                        download
                                    </IconButton>
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
                                                Are you sure you want to delete
                                                this document? AI Agent won't be
                                                able to use this information
                                                anymore.
                                            </p>
                                        }
                                        onConfirm={async () => {
                                            try {
                                                await deleteIngestedFile(
                                                    ingestedFile.id
                                                )

                                                void dispatch(
                                                    notify({
                                                        status: NotificationStatus.Success,
                                                        message:
                                                            'File deleted successfully',
                                                    })
                                                )
                                            } catch (e) {
                                                void dispatch(
                                                    notify({
                                                        status: NotificationStatus.Error,
                                                        message:
                                                            'An unknown error occurred while deleting the file',
                                                    })
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
                                            >
                                                close
                                            </IconButton>
                                        )}
                                    </ConfirmationPopover>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div>
                    <input
                        ref={inputRef}
                        accept={SUPPORTED_TYPES.map(
                            (supportedType) => supportedType.type
                        ).join(',')}
                        type="file"
                        style={{display: 'none'}}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            if (!event.target.files) return
                            void uploadFile(event.target.files[0])
                            event.target.value = ''
                        }}
                    />

                    {maxFilesReached && (
                        <Tooltip target="upload-button">
                            You have reached the maximum number of uploads.
                        </Tooltip>
                    )}

                    <Button
                        id="upload-button"
                        intent="secondary"
                        onClick={() => inputRef.current?.click()}
                        isLoading={isLoading}
                        isDisabled={isLoading || maxFilesReached}
                    >
                        {!isLoading ? (
                            <ButtonIconLabel icon="cloud_upload">
                                Upload File
                            </ButtonIconLabel>
                        ) : (
                            <>Uploading..</>
                        )}
                    </Button>

                    <div className={css.buttonInfo}>
                        Supported types:{' '}
                        {SUPPORTED_TYPES.map(
                            (supportedType) => supportedType.ext
                        ).join(', ')}
                    </div>
                </div>
            </div>
        </>
    )
}
