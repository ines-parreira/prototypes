import type { AttributionModelComparison } from '@gorgias/convert-client'

export type { AttributionModelComparison } from '@gorgias/convert-client'

export const ATTRIBUTION_MODEL_LABELS: Record<
    AttributionModelComparison,
    string
> = {
    klaviyo: 'click 5d > delivery 12h',
    attentive: 'click 5d > delivery 24h',
    postscript: 'click 7d > delivery 24h',
    liverecover: 'discount 10d > delivery 20d',
}

export const ATTRIBUTION_MODEL_HINTS: Record<
    AttributionModelComparison,
    string
> = {
    klaviyo:
        'Orders attributed via 5-day click window with 12-hour delivery window (click priority).',
    attentive:
        'Orders attributed via 5-day click window with 24-hour delivery window (click priority).',
    postscript:
        'Orders attributed via 7-day click window with 24-hour delivery window (click priority).',
    liverecover:
        'Orders attributed via 10-day discount code window with 20-day delivery window (discount-code priority).',
}
