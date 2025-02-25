import { v4 as uuidv4 } from 'uuid'

import { GenericAttachment } from 'common/types'
import { Components } from 'rest_api/help_center_api/client.generated'

import { getEnvironment, GorgiasUIEnv } from '../../utils/environment'
import { getHelpCenterClient } from './index'

type ChannelInfo = Components.Schemas.UploadAttachmentDto['channel']

const buildAttachmentUrl = (signedUrl: string, key: string): string => {
    const env = getEnvironment()

    switch (env) {
        case GorgiasUIEnv.Production:
            return encodeURI('https://attachments.gorgias.help/' + key)
        case GorgiasUIEnv.Staging:
            return encodeURI('https://attachments.gorgias.rehab/' + key)
        case GorgiasUIEnv.Development:
        default:
            return encodeURI(signedUrl + key)
    }
}

/**
 * Firefox does not handle heic/heif MIME type when getting file from
 * drag and drop event, we need to provide it ourselves for the user to
 * be able to send his attachments.
 */
const getFileTypeForFirefox = (fileName: string): string => {
    const fileExt = fileName.split('.').pop()

    switch (fileExt?.toLowerCase()) {
        case 'heic':
            return 'image/heic'
        case 'heif':
            return 'image/heif'
        default:
            return ''
    }
}

// We don't have access to the file extension when getting file from Clipboard
// So we have to infer it from the file MIME type
const getFileExtensionByFileMimeType = (mimeType: string): string => {
    const mimeMap: Record<string, string> = {
        'image/gif': '.gif',
        'image/jpeg': '.jpeg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/svg+xml': '.svg',
        'image/webp': '.webp',
        'image/bmp': '.bmp',
        'image/tiff': '.tif',
        'image/heic': '.heic',
        'video/3gpp': '.3gpp',
        'video/mp4': '.mp4',
        'video/quicktime': '.mov',
        'video/x-msvideo': '.avi',
        'video/x-ms-wmv': '.wmv',
        'video/webm': '.webm',
        'application/pdf': '.pdf',
        'text/csv': '.csv',
        'text/plain': '.txt',
        'application/rtf': '.rtf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            '.xlsx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            '.pptx',
        'application/vnd.oasis.opendocument.spreadsheet': '.ods',
        'text/tab-separated-values': '.tsv',
        'application/vnd.oasis.opendocument.text': '.odt',
        'application/vnd.oasis.opendocument.text-master': '.odm',
        'application/vnd.oasis.opendocument.presentation': '.odp',
        'application/x-rar-compressed': '.rar',
        'application/zip': '.zip',
    }

    return mimeMap[mimeType] || ''
}

export const uploadAttachments = async (
    files: File[],
    channelInfo: ChannelInfo,
): Promise<Array<GenericAttachment & { google_storage_key: string }>> => {
    // 1. generate signed url
    const client = await getHelpCenterClient()

    const uploadAttachment = async (
        file: File,
    ): Promise<GenericAttachment & { google_storage_key: string }> => {
        const fileType = file.type ?? getFileTypeForFirefox(file.name)
        const res = await client.getAttachmentUploadPolicy(
            {},
            {
                channel: channelInfo,
                file: {
                    size: file.size,
                    name:
                        file.name ||
                        `${uuidv4()}${getFileExtensionByFileMimeType(
                            fileType,
                        )}`,
                    mimetype: fileType,
                },
            },
        )
        const { url, fields } = res.data
        // 2. upload file to google
        const inferredFields = fields as Record<string, string>
        const attachmentUrl = buildAttachmentUrl(url, inferredFields.key)

        const formdata = new FormData()
        for (const field in inferredFields) {
            formdata.append(field, inferredFields[field])
        }
        formdata.append('Content-Type', fileType)
        formdata.append('file', file, file.name)

        // Post the file to the Google Cloud Storage
        const response = await fetch(url, {
            method: 'POST',
            body: formdata,
        })

        if (!response.ok) {
            throw new Error('Failed to upload file')
        }

        return {
            content_type: fileType,
            name: file.name,
            size: file.size,
            url: attachmentUrl,
            type: `${channelInfo.type}_attachment`,
            google_storage_key: inferredFields.key,
        }
    }

    const attachments = await Promise.all(files.map(uploadAttachment))

    return attachments
}
