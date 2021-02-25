// List of non-fractional currencies (zero-decimal currencies). Source: https://stripe.com/docs/currencies#zero-decimal
// Supported currencies on Shopify:
// https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency#supported-currencies
export const NON_FRACTIONAL_CURRENCIES = Object.freeze([
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
])

//$TsFixMe fallback value for js, use FinancialStatus enum instead
export const FinancialStatus = Object.freeze({
    PENDING: 'pending',
    AUTHORIZED: 'authorized',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    PARTIALLY_REFUNDED: 'partially_refunded',
    REFUNDED: 'refunded',
    VOIDED: 'voided',
})

//$TsFixMe fallback value for js, use FulfillmentStatus enum instead
export const FulfillmentStatus = Object.freeze({
    FULFILLED: 'fulfilled',
    PARTIAL: 'partial',
    RESTOCKED: 'restocked',
})
