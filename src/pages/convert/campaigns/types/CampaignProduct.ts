import {AttachmentPosition} from './CampaignAttachment'

export interface CampaignProduct {
    id: number
    title: string
    url: string
    price: number
    compareAtPrice?: number
    currency?: string
    featured_image?: string
    variant_name?: string
    position?: AttachmentPosition
}
