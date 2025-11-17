import type { List } from 'immutable'

import { AttachmentEnum } from 'common/types'
import type { CampaignContactFormAttachment } from 'pages/convert/campaigns/types/CampaignAttachment'

export const transformAttachmentsToContactCaptureForms = (
    attachments: List<any>,
): CampaignContactFormAttachment[] => {
    const attachmentsJS: {
        content_type?: string
        name: string
        extra: any
    }[] = attachments.toJS()

    return attachmentsJS
        .filter(
            (attachment) =>
                attachment.content_type === AttachmentEnum.ContactForm,
        )
        .map((attachment) => ({
            contentType: AttachmentEnum.ContactForm,
            name: attachment.name,
            extra: attachment.extra,
        }))
}
