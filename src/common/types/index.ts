import {UniqueDiscountOfferTypeEnum} from 'models/convert/discountOffer/types'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'

export enum UploadType {
    Attachment = 'attachment',
    Avatar = 'avatar_team_picture',
    Profile = 'profile_picture',
    PublicAttachment = 'public_attachment',
    Widget = 'widget_picture',
}

export type GenericAttachment = {
    content_type: string
    name: string
    size: number
    url: string
    type: string
}

export enum AttachmentEnum {
    Product = 'application/productCard',
    DiscountOffer = 'application/discountOffer',
}

export type DiscountOfferAttachment = {
    content_type: AttachmentEnum.DiscountOffer
    name: string
    extra: {
        discount_offer_id: string
        summary?: string
        // these properties are used in ticket view to expose a meaningful state about shopper reply
        // weather the offer has been revealed BEFORE the reply or not, and the snapshot values
        discount_offer_code?: string
        discount_offer_type?: UniqueDiscountOfferTypeEnum
        discount_offer_value?: number
    }
}

export type ProductAttachment = Omit<ProductCardAttachment, 'content_type'> & {
    content_type: AttachmentEnum.Product
}

export type AttachmentType = DiscountOfferAttachment | ProductAttachment

export const attachmentIsDiscountOffer = (
    attachment: AttachmentType
): attachment is DiscountOfferAttachment => {
    return attachment.content_type === AttachmentEnum.DiscountOffer
}

export const attachmentIsProduct = (
    attachment: AttachmentType
): attachment is ProductAttachment => {
    return attachment.content_type === AttachmentEnum.Product
}
