import { AttachmentEnum } from 'common/types'
import type { CampaignDiscountOfferAttachment } from 'pages/convert/campaigns/types/CampaignAttachment'
import type { CampaignDiscountOffer } from 'pages/convert/campaigns/types/CampaignDiscountOffer'

export const transformDiscountOfferToAttachment = (
    offer: CampaignDiscountOffer,
): CampaignDiscountOfferAttachment => {
    return {
        contentType: AttachmentEnum.DiscountOffer,
        name: offer.prefix,
        extra: {
            discount_offer_id: offer.id,
            summary: offer.summary,
        },
    }
}
