import { toast } from '@gorgias/axiom'
import type { AttachmentsConfig } from '@gorgias/copilot'

import { UploadType } from 'common/types'
import { uploadFiles } from 'common/utils/uploadFiles'

type AttachmentUploadError = Parameters<
    NonNullable<AttachmentsConfig['onUploadFailed']>
>[0]

export const uploadCopilotAttachment: NonNullable<
    AttachmentsConfig['onUpload']
> = async (file) => {
    const [uploadedFile] = await uploadFiles([file], {
        type: UploadType.Attachment,
    })

    if (!uploadedFile) {
        throw new Error(`Unable to upload "${file.name}"`)
    }

    return {
        type: 'url',
        value: uploadedFile.url,
        mimeType: uploadedFile.content_type,
        metadata: {
            filename: uploadedFile.name,
            size: uploadedFile.size,
            uploadType: uploadedFile.type,
        },
    }
}

export const handleCopilotAttachmentUploadFailed: NonNullable<
    AttachmentsConfig['onUploadFailed']
> = (error) => {
    const { caption, title } = getCopilotAttachmentUploadErrorToast(error)

    toast.error(title, { caption })
}

export const copilotAttachmentsConfig = {
    enabled: true,
    onUpload: uploadCopilotAttachment,
    onUploadFailed: handleCopilotAttachmentUploadFailed,
} satisfies AttachmentsConfig

function getCopilotAttachmentUploadErrorToast(error: AttachmentUploadError) {
    switch (error.reason) {
        case 'invalid-type':
            return {
                title: 'Unsupported image type',
                caption: error.message || 'Please attach a supported image.',
            }
        case 'file-too-large':
            return {
                title: 'Image is too large',
                caption: error.message || 'Please attach a smaller image.',
            }
        case 'upload-failed':
            return {
                title: 'Could not upload image',
                caption: error.message || 'Please try again.',
            }
    }
}
