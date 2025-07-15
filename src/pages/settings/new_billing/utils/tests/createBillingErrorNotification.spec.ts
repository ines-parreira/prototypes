import { TicketPurpose } from 'state/billing/types'
import { AlertNotification } from 'state/notifications/types'

import createBillingErrorNotification from '../createBillingErrorNotification'

describe('billingErrorNotification', () => {
    const mockContactBilling = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when error is a GorgiasApiError', () => {
        it('should extract error message from API error response', () => {
            const mockApiError = {
                isAxiosError: true,
                response: {
                    data: {
                        error: {
                            msg: 'Payment method declined',
                        },
                    },
                },
            }

            const result = createBillingErrorNotification(
                mockApiError,
                mockContactBilling,
            )

            expect(result.message).toBe('Payment method declined')
        })
    })

    describe('when error is not a GorgiasApiError', () => {
        it('should use default error message for non-API errors', () => {
            const genericError = new Error('Network error')

            const result = createBillingErrorNotification(
                genericError,
                mockContactBilling,
            )

            expect(result.message).toBe(
                `We couldn't update your subscription. Please try again.`,
            )
        })

        it('should use default error message for null error', () => {
            const result = createBillingErrorNotification(
                null,
                mockContactBilling,
            )

            expect(result.message).toBe(
                `We couldn't update your subscription. Please try again.`,
            )
        })

        it('should use default error message for undefined error', () => {
            const result = createBillingErrorNotification(
                undefined,
                mockContactBilling,
            )

            expect(result.message).toBe(
                `We couldn't update your subscription. Please try again.`,
            )
        })

        it('should use default error message for string error', () => {
            const result = createBillingErrorNotification(
                'Something went wrong',
                mockContactBilling,
            )

            expect(result.message).toBe(
                `We couldn't update your subscription. Please try again.`,
            )
        })
    })

    describe('notification button functionality', () => {
        it('should call contactBilling with ERROR ticket purpose when button is clicked', () => {
            const mockApiError = {
                isAxiosError: true,
                response: {
                    data: {
                        error: {
                            msg: 'Payment failed',
                        },
                    },
                },
            }

            const result = createBillingErrorNotification(
                mockApiError,
                mockContactBilling,
            ) as AlertNotification
            const button = result.buttons![0]

            button.onClick!()

            expect(mockContactBilling).toHaveBeenCalledWith(TicketPurpose.ERROR)
            expect(mockContactBilling).toHaveBeenCalledTimes(1)
        })
    })
})
