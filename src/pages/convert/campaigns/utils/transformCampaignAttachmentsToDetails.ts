import { SCENARIO_CONFIG } from 'pages/convert/campaigns/constants/productRecommendationScenarios'

import {
    AttachmentType,
    CampaignAttachment,
    campaignAttachmentIsContactForm,
    campaignAttachmentIsDiscountOffer,
    campaignAttachmentIsProduct,
    campaignAttachmentIsProductRecommendation,
    DiscountOfferAttachment,
    ProductRecommendationAttachment,
} from '../types/CampaignAttachment'

export const transformCampaignAttachmentsToDetails = (
    attachments: CampaignAttachment[],
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
): (unknown | AttachmentType)[] => {
    const transformed = attachments.map((attachment) => {
        // The problem with product attachment there are missing things from ProductCardAttachment
        // like `extra.variant_id` and type miss match from `extra.price`
        if (campaignAttachmentIsProduct(attachment)) {
            return {
                content_type: attachment.contentType,
                name: attachment.name,
                size: attachment.size,
                url: attachment.url,
                extra: {
                    product_id: attachment.extra.product_id,
                    product_link: attachment.extra.product_link,
                    price: attachment.extra.price,
                    compare_at_price: attachment.extra.compare_at_price,
                    featured_image: attachment.url,
                    variant_name: attachment.extra?.variant_name,
                    position: attachment.extra?.position,
                },
            } as unknown
        }
        if (campaignAttachmentIsDiscountOffer(attachment)) {
            return {
                content_type: attachment.contentType,
                name: attachment.name,
                extra: {
                    discount_offer_id: attachment.extra.discount_offer_id,
                    summary: attachment.extra.summary,
                },
            } as DiscountOfferAttachment
        }
        if (campaignAttachmentIsProductRecommendation(attachment)) {
            return {
                content_type: attachment.contentType,
                name: attachment.name,
                extra: {
                    id: attachment.extra.id,
                    scenario: attachment.extra.scenario,
                    description:
                        SCENARIO_CONFIG[attachment.extra.scenario].description,
                },
            } as ProductRecommendationAttachment
        }
        if (campaignAttachmentIsContactForm(attachment)) {
            return {
                content_type: attachment.contentType,
                name: attachment.name,
                extra: attachment.extra,
            } as unknown
        }
    })
    return transformed
}
