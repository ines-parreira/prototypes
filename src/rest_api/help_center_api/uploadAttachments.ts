import {Components} from 'rest_api/help_center_api/client.generated'
import {Attachment} from 'common/types'
import {getHelpCenterClient} from './index'
import {GorgiasUIEnv, getEnvironment} from '../../utils/environment'

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

export const uploadAttachments = async (
    files: File[],
    channelInfo: ChannelInfo
): Promise<Attachment[]> => {
    // 1. generate signed url
    const client = await getHelpCenterClient()

    const uploadAttachment = async (file: File): Promise<Attachment> => {
        const fileType = file.type ?? getFileTypeForFirefox(file.name)
        const res = await client.getAttachmentUploadPolicy(
            {},
            {
                channel: channelInfo,
                file: {
                    size: file.size,
                    name: file.name,
                    mimetype: fileType,
                },
            }
        )
        const {url, fields} = res.data
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
            body: formdata
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        return {
            content_type: fileType,
            name: file.name,
            size: file.size,
            url: attachmentUrl,
            type: `${channelInfo.type}_attachment`,
        }
    }

    const attachments = await Promise.all(files.map(uploadAttachment))

    return attachments
}
