import { renderHook } from '@testing-library/react'

import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { assumeMock } from 'utils/testing'

import { useTrialModalProps } from '../hooks/useTrialModalProps'

jest.mock('models/billing/queries')
jest.mock('models/billing/utils', () => ({
    getAutomateEarlyAccessPricesFormatted: jest.fn(),
}))

const mockUseBillingState = assumeMock(useBillingState)
const mockUseEarlyAccessAutomatePlan = assumeMock(useEarlyAccessAutomatePlan)
const mockGetAutomateEarlyAccessPricesFormatted = jest.requireMock(
    'models/billing/utils',
).getAutomateEarlyAccessPricesFormatted

describe('useTrialModalProps', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock implementations
        mockGetAutomateEarlyAccessPricesFormatted.mockReturnValue({
            amount: '$99',
        })
    })

    describe('useUpgradePlanModal', () => {
        it('should return correct modal props with billing state', () => {
            const mockBillingState = {
                data: {
                    current_plans: {
                        automate: {
                            amount: 5000, // $50 in cents
                            currency: 'USD',
                        },
                        helpdesk: {
                            amount: 10000, // $100 in cents
                            num_quota_tickets: 100,
                        },
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 }, // $99 in cents
            } as any)

            const { result } = renderHook(() => useTrialModalProps())

            expect(result.current.upgradePlanModal).toEqual({
                title: 'Try Shopping Assistant for 14 days at no additional cost',
                currentPlan: {
                    title: 'Support Agent',
                    description: 'Provide best-in-class automated support',
                    price: '$50',
                    billingPeriod: 'month',
                    features: [
                        '2000 automated interactions',
                        'Deliver instant answers to repetitive questions and improve customer satisfaction',
                        'Automatically handle orders, returns, and subscriptions quickly, 24/7',
                    ],
                    buttonText: 'Keep current plan',
                },
                newPlan: {
                    title: 'Support Agent and Shopping Assistant ',
                    description: 'Unlock full potential to drive more sales',
                    price: '$99',
                    billingPeriod: 'month after trial ends',
                    features: [
                        'Everything in Support Agent skills',
                        'Proactively engage with customers to guide discovery',
                        'Personalize recommendations with rich customer insights',
                        'Intelligent upsell using customer input, not guesswork',
                        'Offer discounts based on purchase intent',
                    ],
                    buttonText: 'Try for 14 days',
                    priceTooltipText:
                        'Once you upgrade, each support or sales interaction will cost $1 per resolution, plus a $1 helpdesk fee.',
                },
            })
        })

        it('should handle missing automate plan', () => {
            const mockBillingState = {
                data: {
                    current_plans: {
                        automate: null,
                        helpdesk: {
                            amount: 10000,
                            num_quota_tickets: 100,
                        },
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result } = renderHook(() => useTrialModalProps())

            expect(result.current.upgradePlanModal.currentPlan.price).toBe('$0')
        })

        it('should handle missing helpdesk plan', () => {
            const mockBillingState = {
                data: {
                    current_plans: {
                        automate: {
                            amount: 5000,
                            currency: 'USD',
                        },
                        helpdesk: null,
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result } = renderHook(() => useTrialModalProps())

            expect(
                result.current.upgradePlanModal.newPlan.priceTooltipText,
            ).toContain('$0 helpdesk fee')
        })

        it('should handle null billing state', () => {
            mockUseBillingState.mockReturnValue({ data: null } as any)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result } = renderHook(() => useTrialModalProps())

            expect(result.current.upgradePlanModal.currentPlan.price).toBe('$0')
            expect(
                result.current.upgradePlanModal.newPlan.priceTooltipText,
            ).toContain('$0 helpdesk fee')
        })
    })

    describe('useTrialActivatedModal', () => {
        it('should return correct trial activated modal props', () => {
            mockUseBillingState.mockReturnValue({
                data: {
                    current_plans: {
                        automate: { amount: 5000, currency: 'USD' },
                        helpdesk: { amount: 10000, num_quota_tickets: 100 },
                    },
                },
            } as any)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result } = renderHook(() => useTrialModalProps())

            expect(result.current.trialActivatedModal).toEqual({
                title: 'Trial activated',
            })
        })
    })

    describe('memoization', () => {
        it('should memoize the result when dependencies do not change', () => {
            const mockBillingState = {
                data: {
                    current_plans: {
                        automate: {
                            amount: 5000,
                            currency: 'USD',
                        },
                        helpdesk: {
                            amount: 10000,
                            num_quota_tickets: 100,
                        },
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result, rerender } = renderHook(() => useTrialModalProps())

            const firstResult = result.current

            // Rerender without changing dependencies
            rerender()

            expect(result.current).toBe(firstResult)
        })
    })
})
