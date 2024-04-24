import {AttachmentEnum} from 'common/types'

export interface AttachmentPosition {
    x: number
    y: number
    offsetX: number
    offsetY: number
    size: number
}

export interface CampaignProductAttachment {
    url?: string
    name: string
    contentType: string
    size: number
    extra: object & {
        price: number
        currency?: string
        product_link: string
        product_id: number
        variant_name?: string
        position?: AttachmentPosition
    }
}

export type CampaignDiscountOfferAttachment = {
    contentType: AttachmentEnum.DiscountOffer
    name: string
    extra: {
        discount_offer_id: string
        summary?: string
    }
}

export type CampaignAttachment =
    | CampaignProductAttachment
    | CampaignDiscountOfferAttachment

export const campaignAttachmentIsProduct = (
    attachment: CampaignAttachment
): attachment is CampaignProductAttachment => {
    return attachment.contentType === AttachmentEnum.Product
}

export const campaignAttachmentIsDiscountOffer = (
    attachment: CampaignAttachment
): attachment is CampaignDiscountOfferAttachment => {
    return attachment.contentType === AttachmentEnum.DiscountOffer
}
