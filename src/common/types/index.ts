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
    ProductRecommendation = 'application/productRecommendation',
    DiscountOffer = 'application/discountOffer',
}
