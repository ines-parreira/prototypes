import { reportCRMGrowthError } from '../reportCRMGrowthError'

jest.mock('@sentry/react', () => ({
    captureException: jest.fn(),
}))

describe('reportCRMGrowthError', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should create formatted error with message from Error instance', () => {
        const error = new Error('Card payment failed')
        reportCRMGrowthError(error, 'Failed to process payment')

        expect(console.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Failed to process payment: Card payment failed',
            }),
        )
    })

    it('should fallback to "Unknown error" for Stripe error object', () => {
        const stripeError = {
            code: 'card_declined',
            decline_code: 'insufficient_funds',
            message: 'Your card has insufficient funds.',
            doc_url: 'https://stripe.com/docs/error-codes/card-declined',
        }
        reportCRMGrowthError(stripeError, 'Failed to submit billing contact')

        expect(console.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Failed to submit billing contact: Unknown error',
            }),
        )
        expect(console.error).toHaveBeenCalledWith(
            'Error extra:',
            expect.objectContaining({
                context: 'Failed to submit billing contact',
                originalError: stripeError,
            }),
        )
    })

    it('should fallback to "Unknown error" when object has no message', () => {
        const error = { code: 'UNKNOWN_ERROR', statusCode: 500 }
        reportCRMGrowthError(error, 'Failed to load stripe')

        expect(console.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Failed to load stripe: Unknown error',
            }),
        )
        expect(console.error).toHaveBeenCalledWith(
            'Error extra:',
            expect.objectContaining({
                originalError: error,
            }),
        )
    })
    it('should handle null error', () => {
        reportCRMGrowthError(null, 'Unexpected null error')

        expect(console.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Unexpected null error: Unknown error',
            }),
        )
        expect(console.error).toHaveBeenCalledWith(
            'Error extra:',
            expect.objectContaining({
                originalError: null,
            }),
        )
    })

    it('should handle undefined error', () => {
        reportCRMGrowthError(undefined, 'Unexpected undefined error')

        expect(console.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Unexpected undefined error: Unknown error',
            }),
        )
    })

    it('should handle string error directly', () => {
        reportCRMGrowthError('Something went wrong', 'Failed operation')

        expect(console.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Failed operation: Something went wrong',
            }),
        )
        expect(console.error).toHaveBeenCalledWith(
            'Error extra:',
            expect.objectContaining({
                originalError: 'Something went wrong',
            }),
        )
    })

    it('should handle empty string message in object', () => {
        const error = { message: '' }
        reportCRMGrowthError(error, 'Empty message error')

        expect(console.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Empty message error: Unknown error',
            }),
        )
    })

    it('should preserve context and team tag in extras', () => {
        const error = new Error('Test error')
        const context = 'Test context'

        reportCRMGrowthError(error, context)

        expect(console.error).toHaveBeenCalledWith(
            'Error extra:',
            expect.objectContaining({
                context,
                originalError: error,
            }),
        )
    })
})
