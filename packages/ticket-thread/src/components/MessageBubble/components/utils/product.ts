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

export type ReviewedProductData = {
    averageScore: number | null
    categoryName: string | null
    description: string | null
    imageUrl: string | null
    name: string
    totalReviews: number | null
    url: string | null
}

function getNumberLike(value: unknown): number | null {
    if (value === '') {
        return null
    }

    const parsedValue = Number(value)

    return Number.isFinite(parsedValue) ? parsedValue : null
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

export function getReviewedProductData(
    meta: unknown,
): ReviewedProductData | null {
    const product = asRecord(asRecord(meta).product)
    const firstImage = Array.isArray(product.images)
        ? asRecord(product.images[0])
        : {}
    const name = getString(product, 'name')
    const averageScore = product.average_score
    const totalReviews = product.total_reviews

    if (!name) {
        return null
    }

    return {
        averageScore: getNumberLike(averageScore),
        categoryName: getString(asRecord(product.category), 'name'),
        description: getString(product, 'description'),
        imageUrl:
            getString(firstImage, 'square') ??
            getString(firstImage, 'original'),
        name,
        totalReviews: getNumberLike(totalReviews),
        url: getString(product, 'url'),
    }
}

export function isProductAttachment(
    attachment: TicketMessageAttachment,
): boolean {
    return attachment.content_type === PRODUCT_CARD_CONTENT_TYPE
}
