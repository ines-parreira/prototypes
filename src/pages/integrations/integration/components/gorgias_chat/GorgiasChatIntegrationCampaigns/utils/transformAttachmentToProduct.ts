import {List} from 'immutable'
import {CampaignProduct} from '../types/CampaignProduct'

type AttachmentImmutable = {
    content_type: string
    name: string
    size: number
    url: string
    extra: {
        product_id: number
        variant_id: number
        price: string
        variant_name: string
        product_link: string
        currency: string
        featured_image: string
    }
}

export function transformAttachmentToProduct(attachments: List<any>) {
    return (attachments.toJS() as AttachmentImmutable[]).map((attachment) => {
        return {
            id: attachment.extra?.product_id,
            title: attachment.name,
            url: attachment.extra.product_link,
            price: parseFloat(attachment.extra?.price),
            currency: attachment.extra?.currency,
            featured_image: attachment.extra?.featured_image,
            variant_name: attachment.extra?.variant_name,
        }
    }) as CampaignProduct[]
}
