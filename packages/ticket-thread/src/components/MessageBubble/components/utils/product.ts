import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { asRecord, getString, getStringLike } from './attachment'

const PRODUCT_CARD_CONTENT_TYPE = 'application/productCard'

export type ProductAttachmentData = {
    compareAtPrice?: string
    currencyCode: string | null
    link: string
    price?: string
    variantName: string | null
}

function getProductAttachmentLink(extra: Record<string, unknown>): string {
    for (const key of [
        'variant_link',
        'product_link',
        'shortened_product_link',
    ]) {
        const value = extra[key]

        if (typeof value === 'string' && value.length > 0) {
            return value
        }
    }

    return '#'
}

export function getProductAttachmentData(
    attachment: TicketMessageAttachment,
): ProductAttachmentData {
    const extra = asRecord(attachment.extra)

    return {
        link: getProductAttachmentLink(extra),
        variantName: getString(extra, 'variant_name'),
        currencyCode: getString(extra, 'currency'),
        price: getStringLike(extra, 'price'),
        compareAtPrice: getStringLike(extra, 'compare_at_price'),
    }
}

export function isProductAttachment(
    attachment: TicketMessageAttachment,
): boolean {
    return attachment.content_type === PRODUCT_CARD_CONTENT_TYPE
}
