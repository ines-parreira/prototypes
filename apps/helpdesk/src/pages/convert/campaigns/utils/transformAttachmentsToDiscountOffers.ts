import type { List } from 'immutable'

import type { AttachmentType } from 'pages/convert/campaigns/types/CampaignAttachment'
import { attachmentIsDiscountOffer } from 'pages/convert/campaigns/types/CampaignAttachment'
import type { CampaignDiscountOffer } from 'pages/convert/campaigns/types/CampaignDiscountOffer'

export const transformAttachmentsToDiscountOffers = (
    attachments: List<any>,
): CampaignDiscountOffer[] => {
    const attachmentsJS: AttachmentType[] = attachments.toJS()

    return attachmentsJS.filter(attachmentIsDiscountOffer).map((att) => {
        return {
            id: att.extra.discount_offer_id,
            prefix: att.name,
            summary: att.extra.summary,
        }
    })
}
