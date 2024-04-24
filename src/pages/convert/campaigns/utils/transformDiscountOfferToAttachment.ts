import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import {AttachmentEnum} from 'common/types'
import {CampaignDiscountOfferAttachment} from 'pages/convert/campaigns/types/CampaignAttachment'

export const transformDiscountOfferToAttachment = (
    offer: CampaignDiscountOffer
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
