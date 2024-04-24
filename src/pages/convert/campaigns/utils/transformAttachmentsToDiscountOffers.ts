import {List} from 'immutable'
import {AttachmentType, attachmentIsDiscountOffer} from 'common/types'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'

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
