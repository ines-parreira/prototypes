import type { List } from 'immutable'

import type { AttachmentPosition } from '../types/CampaignAttachment'
import type { CampaignProduct } from '../types/CampaignProduct'

type AttachmentImmutable = {
    content_type: string
    name: string
    size: number
    url: string
    extra: {
        product_id: number
        variant_id: number
        price: string
        compare_at_price?: string
        variant_name: string
        product_link: string
        currency: string
        featured_image: string
        position?: AttachmentPosition
    }
}

export function transformAttachmentToProduct(
    attachments: List<any>,
    context: { currency?: string },
) {
    return (attachments.toJS() as AttachmentImmutable[])
        .filter(
            (attachment) =>
                attachment.content_type === 'application/productCard',
        )
        .map((attachment) => {
            return {
                id: attachment.extra?.product_id,
                title: attachment.name,
                url: attachment.extra.product_link,
                price: parseFloat(attachment.extra?.price),
                compareAtPrice: attachment.extra?.compare_at_price
                    ? parseFloat(attachment.extra?.compare_at_price)
                    : undefined,
                currency:
                    attachment.extra?.currency ?? context.currency ?? 'USD',
                featured_image: attachment.extra?.featured_image,
                variant_name: attachment.extra?.variant_name,
                position: attachment.extra?.position,
            }
        }) as CampaignProduct[]
}
