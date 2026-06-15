import { getMoneySymbol } from '@repo/utils'

import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { asRecord, getString } from './attachment'

const DISCOUNT_OFFER_CONTENT_TYPE = 'application/discountOffer'

type DiscountOfferAttachmentData = {
    name: string
    summary: string | null
}

function getStringOrNumber(
    record: Record<string, unknown>,
    key: string,
): string | number | null {
    const value = record[key]

    return typeof value === 'string' || typeof value === 'number' ? value : null
}

function computeDiscountOfferSummary(
    extra: Record<string, unknown>,
): string | null {
    const type = getString(extra, 'discount_offer_type')
    const value = getStringOrNumber(extra, 'discount_offer_value')

    switch (type) {
        case 'fixed': {
            const currency = getString(extra, 'currency')

            if (!currency || value === null) {
                return null
            }

            return `${getMoneySymbol(currency)}${value} off`
        }
        case 'percentage':
            return value !== null ? `${value}% off` : null
        case 'free_shipping':
            return 'Free shipping'
        default:
            return null
    }
}

export function isDiscountOfferAttachment(
    attachment: TicketMessageAttachment,
): boolean {
    return attachment.content_type === DISCOUNT_OFFER_CONTENT_TYPE
}

export function getDiscountOfferAttachmentData(
    attachment: TicketMessageAttachment,
): DiscountOfferAttachmentData {
    const extra = asRecord(attachment.extra)
    const discountOfferCode = getString(extra, 'discount_offer_code')
    const attachmentSummary = getString(extra, 'summary')
    const computedSummary = computeDiscountOfferSummary(extra)
    const summary = computedSummary || attachmentSummary || discountOfferCode
    const name =
        (computedSummary ? discountOfferCode : null) ??
        attachment.name ??
        'Discount offer'

    return {
        name,
        summary: summary ?? null,
    }
}
