import {List} from 'immutable'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import {
    attachmentIsDiscountOffer,
    AttachmentType,
} from 'pages/convert/campaigns/types/CampaignAttachment'

export const transformAttachmentsToDiscountOffers = (
    attachments: List<any>
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
