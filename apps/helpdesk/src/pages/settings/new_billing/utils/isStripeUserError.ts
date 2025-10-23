import { StripeError } from '@stripe/stripe-js'

const STRIPE_USER_ERROR_CODES = [
    'card_declined',
    'expired_card',
    'incorrect_cvc',
    'incorrect_number',
    'invalid_cvc',
    'invalid_expiry_month',
    'invalid_expiry_year',
    'invalid_number',
    'postal_code_invalid',
]

const isStripeError = (error: unknown): error is StripeError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as StripeError).code === 'string'
    )
}

export const isStripeUserError = (error: unknown): boolean => {
    if (isStripeError(error)) {
        return STRIPE_USER_ERROR_CODES.includes(error.code!)
    }

    return false
}
