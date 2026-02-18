import { useCallback, useState } from 'react'

import { Skeleton } from '@gorgias/axiom'

import { FieldPresentation } from 'AIJourney/components'
import type { GenericAttachment } from 'common/types'
import uploadFiles from 'common/utils/uploadFiles'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    DropText,
    DropZone,
    HelpText,
} from 'pages/common/components/ImageUpload'
import { MAX_IMAGE_SIZE } from 'pages/settings/helpCenter/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getFileTooLargeError } from 'utils/file'

import css from './UploadImage.less'

export type UploadedImageAttachment = Pick<
    GenericAttachment,
    'url' | 'name' | 'content_type'
>

interface UploadImageFieldProps {
    imageUrl?: string
    onChange?: (attachment: UploadedImageAttachment[] | undefined) => void
}

export const UploadImageField = ({
    imageUrl,
    onChange,
}: UploadImageFieldProps) => {
    const dispatch = useAppDispatch()
    const [isUploading, setIsUploading] = useState(false)

    const uploadFile = useCallback(
        async (file: File) => {
            if (file.size > MAX_IMAGE_SIZE) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: getFileTooLargeError(MAX_IMAGE_SIZE),
                    }),
                )
                return
            }

            try {
                setIsUploading(true)
                const uploadedFiles = await uploadFiles([file])
                if (uploadedFiles && uploadedFiles[0]) {
                    const { url, name, content_type } = uploadedFiles[0]
                    onChange?.([{ url, name, content_type }])
                }
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Error uploading image: ${error}`,
                    }),
                )
            } finally {
                setIsUploading(false)
            }
        },
        [dispatch, onChange],
    )

    const handleOnChangeFile = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = event.target.files?.[0]
            if (selectedFile) {
                await uploadFile(selectedFile)
            }
        },
        [uploadFile],
    )

    const handleOnDropFile = useCallback(
        async (event: DragEvent) => {
            const droppedFile = event.dataTransfer?.files?.[0]
            if (droppedFile) {
                await uploadFile(droppedFile)
            }
        },
        [uploadFile],
    )

    const handleOnRemoveFile = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation()
            event.preventDefault()
            onChange?.([])
        },
        [onChange],
    )

    const closeSpan = (
        <span className={css.close} onClick={handleOnRemoveFile}>
            <i className="material-icons-outlined">close</i>
        </span>
    )

    let content = (
        <div className={css.content}>
            <DropText imageRole="default" />
        </div>
    )
    if (isUploading) {
        content = (
            <div className={css.loadingContainer}>
                <Skeleton height={8} width={96} />
            </div>
        )
    } else if (imageUrl) {
        content = (
            <>
                {closeSpan}
                <img
                    data-testid="image-upload-preview"
                    className={css.preview}
                    alt="Uploaded image"
                    src={imageUrl}
                />
            </>
        )
    }

    return (
        <div className={css.uploadImageField}>
            <FieldPresentation
                name="Upload custom image"
                description="Upload a custom image to include in your messages"
            />
            <DropZone
                id="ai-journey-image-upload"
                accept="image/jpeg,image/png,image/jpg"
                imageRole="default"
                onDrop={handleOnDropFile}
                onChange={handleOnChangeFile}
                className={css.dropZone}
            >
                {content}
            </DropZone>
            <HelpText
                text="Supported formats: JPG, PNG. Maximum file size: 5MB"
                className={css.helpText}
            />
        </div>
    )
}
