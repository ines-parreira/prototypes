import {UniqueDiscountOfferTypeEnum} from 'models/convert/discountOffer/types'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {AttachmentEnum} from 'common/types'

/*
 * Campaign-prefixed interfaces and types are used in the context of communication
 * with the backend (Convert Service API).
 */
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
    contentType: AttachmentEnum.Product
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

export type CampaignProductRecommendation = {
    contentType: AttachmentEnum.ProductRecommendation
    name: string
    extra: {
        id: string
        scenario: ProductRecommendationScenario
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

export type CampaignContactFormAttachment = {
    contentType: AttachmentEnum.ContactForm
    name: string
    extra: CampaignFormExtra | null | undefined
}

export type CampaignAttachment =
    | CampaignProductAttachment
    | CampaignDiscountOfferAttachment
    | CampaignProductRecommendation
    | CampaignContactFormAttachment

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

export const campaignAttachmentIsProductRecommendation = (
    attachment: CampaignAttachment
): attachment is CampaignProductRecommendation => {
    return attachment.contentType === AttachmentEnum.ProductRecommendation
}

export const campaignAttachmentIsContactForm = (
    attachment: CampaignAttachment
): attachment is CampaignContactFormAttachment =>
    attachment.contentType === AttachmentEnum.ContactForm

export type ContactFormTargetType = 'shopify' | 'gorgias'

export type ContactFormSubscriberType = 'email' | 'sms'

export type ContactFormTarget = {
    type: ContactFormTargetType
    subscriber_types: ContactFormSubscriberType[]
    tags: string[] | undefined
}

export enum ContactFormFieldType {
    Email = 'email',
    Phone = 'phone',
    Text = 'text',
}

export type ContactFormFieldName =
    | 'email'
    | 'phone'
    | 'first_name'
    | 'last_name'

export type ContactFormField = {
    name: ContactFormFieldName
    label: string | undefined
    type: ContactFormFieldType
    required: boolean
}

export type ContactFormOnSuccessContent = {
    message: string | undefined
}

export type ContactFormStep = {
    cta: string | undefined
    fields: ContactFormField[]
}

export type CampaignFormExtra = {
    steps: ContactFormStep[]
    on_success_content: ContactFormOnSuccessContent
    targets: ContactFormTarget[]
    disclaimer: string
    disclaimer_default_accepted: boolean | undefined
}
/*
 * Types and enums below are used in the context of the editor and Chat preview components
 */
export enum ProductRecommendationScenario {
    SimilarSeen = 'similar_seen',
    SimilarBought = 'similar_bought',
    OutOfStockAlternatives = 'out_of_stock_alternatives',
    Newest = 'newest',
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

export type ProductRecommendationAttachment = {
    content_type: AttachmentEnum.ProductRecommendation
    name: string
    extra: {
        id: string
        scenario: ProductRecommendationScenario
        description?: string
    }
}

export type ContactCaptureFormAttachment = {
    content_type: AttachmentEnum.ContactForm
    name: string
    extra?: CampaignFormExtra | null
}

export type AttachmentType =
    | DiscountOfferAttachment
    | ProductCardAttachment
    | ProductRecommendationAttachment
    | ContactCaptureFormAttachment

export const attachmentIsDiscountOffer = (
    attachment: AttachmentType
): attachment is DiscountOfferAttachment => {
    return attachment.content_type === AttachmentEnum.DiscountOffer
}

export const attachmentIsProduct = (
    attachment: AttachmentType
): attachment is ProductCardAttachment => {
    return attachment.content_type === AttachmentEnum.Product
}

export const attachmentIsProductRecommendation = (
    attachment: AttachmentType
): attachment is ProductRecommendationAttachment => {
    return attachment.content_type === AttachmentEnum.ProductRecommendation
}

export const attachmentIsContactCaptureForm = (
    attachment: AttachmentType
): attachment is ContactCaptureFormAttachment => {
    return attachment.content_type === AttachmentEnum.ContactForm
}
