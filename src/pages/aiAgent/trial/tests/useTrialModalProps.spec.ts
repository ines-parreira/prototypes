import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useShoppingAssistantTrialAccess } from '../hooks/useShoppingAssistantTrialAccess'
import { useTrialMetrics } from '../hooks/useTrialMetrics'
import { useTrialModalProps } from '../hooks/useTrialModalProps'

jest.mock('models/billing/queries')
jest.mock('models/billing/utils', () => ({
    getAutomateEarlyAccessPricesFormatted: jest.fn(),
}))
jest.mock('../hooks/useTrialMetrics')
jest.mock('../hooks/useShoppingAssistantTrialAccess')

const mockUseBillingState = assumeMock(useBillingState)
const mockUseEarlyAccessAutomatePlan = assumeMock(useEarlyAccessAutomatePlan)
const mockUseTrialMetrics = assumeMock(useTrialMetrics)
const mockUseShoppingAssistantTrialAccess = assumeMock(
    useShoppingAssistantTrialAccess,
)
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

        mockUseTrialMetrics.mockReturnValue({
            gmv: 25,
            remainingDays: 14,
            isLoading: false,
        })

        mockUseShoppingAssistantTrialAccess.mockReturnValue({
            canSeeTrialStartedBanner: false,
            canBookDemo: false,
            canSeeSystemBanner: false,
            canSeeTrialCTA: false,
            canNotifyAdmin: false,
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

            const { result } = renderHook(() => useTrialModalProps({}))

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

            const { result } = renderHook(() => useTrialModalProps({}))

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

            const { result } = renderHook(() => useTrialModalProps({}))

            expect(
                result.current.upgradePlanModal.newPlan.priceTooltipText,
            ).toContain('$0 helpdesk fee')
        })

        it('should handle null billing state', () => {
            mockUseBillingState.mockReturnValue({ data: null } as any)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result } = renderHook(() => useTrialModalProps({}))

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

            const { result } = renderHook(() => useTrialModalProps({}))

            expect(result.current.trialActivatedModal).toEqual({
                title: 'Trial activated',
            })
        })
    })

    describe('useTrialStartedBanner', () => {
        it('should return correct banner with trial metrics', () => {
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

            mockUseTrialMetrics.mockReturnValue({
                gmv: 25,
                remainingDays: 7,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialModalProps({}))

            expect(result.current.trialStartedBanner).toEqual({
                title: 'Shopping Assistant trial ends in 7 days.',
                description:
                    "So far, it's generated 25 in added GMV for your store.",
            })
        })

        it('should update when trial metrics change', () => {
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

            const { result, rerender } = renderHook(() =>
                useTrialModalProps({}),
            )

            // Initial values
            expect(result.current.trialStartedBanner.title).toBe(
                'Shopping Assistant trial ends in 14 days.',
            )

            // Update metrics
            mockUseTrialMetrics.mockReturnValue({
                gmv: 50,
                remainingDays: 3,
                isLoading: false,
            })

            rerender()

            expect(result.current.trialStartedBanner).toEqual({
                title: 'Shopping Assistant trial ends in 3 days.',
                description:
                    "So far, it's generated 50 in added GMV for your store.",
            })
        })
    })

    describe('useTrialAlertBanner', () => {
        beforeEach(() => {
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
        })

        it('should return correct alert banner when user can book demo', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialStartedBanner: false,
                canBookDemo: true,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
            })

            const { result } = renderHook(() => useTrialModalProps({}))

            expect(result.current.trialAlertBanner).toEqual({
                title: 'Drive more revenue with Shopping Assistant',
                description:
                    "Make every interaction personal. With AI Agent's new shopping assistant features, you can offer real-time recommendations powered by rich insights and persuasive selling skills that help customers buy with confidence.",
                primaryAction: {
                    label: 'Try for 14 days',
                    onClick: expect.any(Function),
                },
                secondaryAction: {
                    label: 'Book a demo',
                    onClick: expect.any(Function),
                },
            })
        })

        it('should return correct alert banner when user cannot book demo', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialStartedBanner: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
            })

            const { result } = renderHook(() => useTrialModalProps({}))

            expect(result.current.trialAlertBanner.secondaryAction).toEqual({
                label: 'How Shopping Assistant Accelerates Growth',
                onClick: expect.any(Function),
            })
        })

        it('should call onConfirmTrial when primary action is clicked', () => {
            const mockOnConfirmTrial = jest.fn()

            const { result } = renderHook(() =>
                useTrialModalProps({ onConfirmTrial: mockOnConfirmTrial }),
            )

            result.current.trialAlertBanner.primaryAction?.onClick()

            expect(mockOnConfirmTrial).toHaveBeenCalled()
        })

        it('should open demo link when "Book a demo" is clicked', () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialStartedBanner: false,
                canBookDemo: true,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
            })

            const { result } = renderHook(() => useTrialModalProps({}))

            result.current.trialAlertBanner.secondaryAction?.onClick()

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://www.gorgias.com/demo/customers/automate',
                '_blank',
            )
        })

        it('should open shopping assistant page when growth link is clicked', () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialStartedBanner: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
            })

            const { result } = renderHook(() => useTrialModalProps({}))

            result.current.trialAlertBanner.secondaryAction?.onClick()

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://www.gorgias.com/ai-shopping-assistant',
                '_blank',
            )
        })

        it('should provide default empty function when onConfirmTrial is not provided', () => {
            const { result } = renderHook(() => useTrialModalProps({}))

            // Should not throw when called
            expect(() => {
                result.current.trialAlertBanner.primaryAction?.onClick()
            }).not.toThrow()
        })
    })

    describe('currency formatting', () => {
        it('should format amounts with different currencies correctly', () => {
            const mockBillingState = {
                data: {
                    current_plans: {
                        automate: {
                            amount: 5000, // €50 in cents
                            currency: 'EUR',
                        },
                        helpdesk: {
                            amount: 10000, // €100 in cents
                            num_quota_tickets: 100,
                        },
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result } = renderHook(() => useTrialModalProps({}))

            expect(result.current.upgradePlanModal.currentPlan.price).toBe(
                '€50',
            )
            expect(
                result.current.upgradePlanModal.newPlan.priceTooltipText,
            ).toContain('€1 helpdesk fee')
        })

        it('should handle zero amounts correctly', () => {
            const mockBillingState = {
                data: {
                    current_plans: {
                        automate: {
                            amount: 0,
                            currency: 'USD',
                        },
                        helpdesk: {
                            amount: 0,
                            num_quota_tickets: 100,
                        },
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result } = renderHook(() => useTrialModalProps({}))

            expect(result.current.upgradePlanModal.currentPlan.price).toBe('$0')
            expect(
                result.current.upgradePlanModal.newPlan.priceTooltipText,
            ).toContain('$0 helpdesk fee')
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

            const { result, rerender } = renderHook(() =>
                useTrialModalProps({}),
            )

            const firstResult = result.current

            // Rerender without changing dependencies
            rerender()

            expect(result.current).toBe(firstResult)
        })

        it('should create new object when onConfirmTrial changes', () => {
            const mockBillingState = {
                data: {
                    current_plans: {
                        automate: { amount: 5000, currency: 'USD' },
                        helpdesk: { amount: 10000, num_quota_tickets: 100 },
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const mockOnConfirmTrial1 = jest.fn()
            const mockOnConfirmTrial2 = jest.fn()

            const { result, rerender } = renderHook(
                ({ onConfirmTrial }) => useTrialModalProps({ onConfirmTrial }),
                {
                    initialProps: { onConfirmTrial: mockOnConfirmTrial1 },
                },
            )

            const firstResult = result.current

            // Change the callback
            rerender({ onConfirmTrial: mockOnConfirmTrial2 })

            // The result should be different because onConfirmTrial changed
            expect(result.current).not.toBe(firstResult)
            expect(
                result.current.trialAlertBanner.primaryAction?.onClick,
            ).not.toBe(firstResult.trialAlertBanner.primaryAction?.onClick)
        })
    })

    describe('edge cases', () => {
        it('should handle undefined early access plan data', () => {
            mockUseBillingState.mockReturnValue({
                data: {
                    current_plans: {
                        automate: { amount: 5000, currency: 'USD' },
                        helpdesk: { amount: 10000, num_quota_tickets: 100 },
                    },
                },
            } as any)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: undefined,
            } as any)
            mockGetAutomateEarlyAccessPricesFormatted.mockReturnValue({
                amount: '$0',
            })

            const { result } = renderHook(() => useTrialModalProps({}))

            expect(result.current.upgradePlanModal.newPlan.price).toBe('$0')
        })
    })
})
