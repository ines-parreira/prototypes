import { StripeError } from '@stripe/stripe-js'

import { isStripeUserError } from '../isStripeUserError'

const createStripeError = (code: string): StripeError => {
    return {
        type: 'card_error',
        code,
        message: `Stripe error: ${code}`,
    }
}

describe('isStripeUserError', () => {
    describe('returns true for Stripe user errors', () => {
        it('should return true for card_declined error code', () => {
            const error = createStripeError('card_declined')
            expect(isStripeUserError(error)).toBe(true)
        })

        it('should return true for expired_card error code', () => {
            const error = createStripeError('expired_card')
            expect(isStripeUserError(error)).toBe(true)
        })

        it('should return true for incorrect_cvc error code', () => {
            const error = createStripeError('incorrect_cvc')
            expect(isStripeUserError(error)).toBe(true)
        })

        it('should return true for incorrect_number error code', () => {
            const error = createStripeError('incorrect_number')
            expect(isStripeUserError(error)).toBe(true)
        })

        it('should return true for invalid_cvc error code', () => {
            const error = createStripeError('invalid_cvc')
            expect(isStripeUserError(error)).toBe(true)
        })

        it('should return true for invalid_expiry_month error code', () => {
            const error = createStripeError('invalid_expiry_month')
            expect(isStripeUserError(error)).toBe(true)
        })

        it('should return true for invalid_expiry_year error code', () => {
            const error = createStripeError('invalid_expiry_year')
            expect(isStripeUserError(error)).toBe(true)
        })

        it('should return true for invalid_number error code', () => {
            const error = createStripeError('invalid_number')
            expect(isStripeUserError(error)).toBe(true)
        })

        it('should return true for postal_code_invalid error code', () => {
            const error = createStripeError('postal_code_invalid')
            expect(isStripeUserError(error)).toBe(true)
        })
    })

    describe('returns false for non-user errors', () => {
        it('should return false for Stripe errors with non-user error codes', () => {
            const error = createStripeError('processing_error')
            expect(isStripeUserError(error)).toBe(false)
        })

        it('should return false for Stripe API errors', () => {
            const error: StripeError = {
                type: 'api_error',
                code: 'rate_limit',
                message: 'Rate limit exceeded',
            }
            expect(isStripeUserError(error)).toBe(false)
        })

        it('should return false for generic errors', () => {
            const error = new Error('Generic error')
            expect(isStripeUserError(error)).toBe(false)
        })

        it('should return false for null error', () => {
            expect(isStripeUserError(null)).toBe(false)
        })

        it('should return false for undefined error', () => {
            expect(isStripeUserError(undefined)).toBe(false)
        })

        it('should return false for objects without code property', () => {
            const error = { type: 'card_error', message: 'Some error' }
            expect(isStripeUserError(error)).toBe(false)
        })

        it('should return false for objects with non-string code', () => {
            const error = { code: 123 }
            expect(isStripeUserError(error)).toBe(false)
        })
    })
})
