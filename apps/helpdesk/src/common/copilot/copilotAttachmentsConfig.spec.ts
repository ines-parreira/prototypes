import { toast } from '@gorgias/axiom'

import { UploadType } from 'common/types'
import { uploadFiles } from 'common/utils/uploadFiles'

import {
    copilotAttachmentsConfig,
    handleCopilotAttachmentUploadFailed,
    uploadCopilotAttachment,
} from './copilotAttachmentsConfig'

jest.mock('common/utils/uploadFiles')

const uploadFilesMock = uploadFiles as jest.MockedFunction<typeof uploadFiles>

describe('copilotAttachmentsConfig', () => {
    it('enables attachment uploads with default accepted image types and size limit', () => {
        expect(copilotAttachmentsConfig).toMatchObject({
            enabled: true,
            onUpload: uploadCopilotAttachment,
            onUploadFailed: handleCopilotAttachmentUploadFailed,
        })
    })
})

describe('uploadCopilotAttachment', () => {
    beforeEach(() => {
        uploadFilesMock.mockReset()
    })

    it('uploads images as private attachments and returns a Copilot URL source', async () => {
        const file = new File(['image'], 'photo.png', { type: 'image/png' })
        uploadFilesMock.mockResolvedValue([
            {
                content_type: 'image/png',
                name: 'photo.png',
                size: file.size,
                type: 'attachment',
                url: 'https://uploads.gorgias.io/abc/photo.png',
            },
        ])

        await expect(uploadCopilotAttachment(file)).resolves.toEqual({
            type: 'url',
            value: 'https://uploads.gorgias.io/abc/photo.png',
            mimeType: 'image/png',
            metadata: {
                filename: 'photo.png',
                size: file.size,
                uploadType: 'attachment',
            },
        })
        expect(uploadFilesMock).toHaveBeenCalledWith([file], {
            type: UploadType.Attachment,
        })
    })

    it('fails when the upload endpoint does not return a file', async () => {
        const file = new File(['image'], 'photo.png', { type: 'image/png' })
        uploadFilesMock.mockResolvedValue([])

        await expect(uploadCopilotAttachment(file)).rejects.toThrow(
            'Unable to upload "photo.png"',
        )
    })
})

describe('handleCopilotAttachmentUploadFailed', () => {
    const file = new File(['image'], 'photo.png', { type: 'image/png' })

    beforeEach(() => {
        jest.spyOn(toast, 'error').mockReturnValue('toast-id')
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('shows a clear error for unsupported image types', () => {
        handleCopilotAttachmentUploadFailed({
            reason: 'invalid-type',
            file,
            message: 'Invalid file type',
        })

        expect(toast.error).toHaveBeenCalledWith('Unsupported image type', {
            caption: 'Invalid file type',
        })
    })

    it('shows a clear error for oversized images', () => {
        handleCopilotAttachmentUploadFailed({
            reason: 'file-too-large',
            file,
            message: 'File is too large',
        })

        expect(toast.error).toHaveBeenCalledWith('Image is too large', {
            caption: 'File is too large',
        })
    })

    it('shows the upload failure message when upload fails', () => {
        handleCopilotAttachmentUploadFailed({
            reason: 'upload-failed',
            file,
            message: 'Network error',
        })

        expect(toast.error).toHaveBeenCalledWith('Could not upload image', {
            caption: 'Network error',
        })
    })
})
