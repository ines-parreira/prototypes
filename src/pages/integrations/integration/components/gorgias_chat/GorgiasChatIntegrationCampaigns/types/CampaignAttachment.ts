export interface AttachmentPosition {
    x: number
    y: number
    offsetX: number
    offsetY: number
    size: number
}

export interface CampaignAttachment {
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
