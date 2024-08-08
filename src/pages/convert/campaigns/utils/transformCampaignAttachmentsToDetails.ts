import {
    CampaignAttachment,
    campaignAttachmentIsDiscountOffer,
    campaignAttachmentIsProduct,
    DiscountOfferAttachment,
} from '../types/CampaignAttachment'

export const transformCampaignAttachmentsToDetails = (
    attachments: CampaignAttachment[]
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
): (unknown | DiscountOfferAttachment)[] => {
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
    })
    return transformed
}
