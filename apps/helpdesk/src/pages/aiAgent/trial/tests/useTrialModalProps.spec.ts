import * as React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Route, Router } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import {
    useShoppingAssistantTrialFlow,
    UseShoppingAssistantTrialFlowReturn,
} from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'

jest.mock('models/billing/queries')
jest.mock('models/billing/utils', () => ({
    getAutomateEarlyAccessPricesFormatted: jest.fn(),
}))
jest.mock('pages/aiAgent/trial/hooks/useTrialMetrics')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('hooks/useAppSelector')
jest.mock('hooks/useAppDispatch')

const mockUseBillingState = assumeMock(useBillingState)
const mockUseEarlyAccessAutomatePlan = assumeMock(useEarlyAccessAutomatePlan)
const mockUseTrialMetrics = assumeMock(useTrialMetrics)
const mockUseTrialEnding = assumeMock(useTrialEnding)
const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockUseShoppingAssistantTrialAccess = assumeMock(
    useShoppingAssistantTrialAccess,
)
const mockGetAutomateEarlyAccessPricesFormatted = jest.requireMock(
    'models/billing/utils',
).getAutomateEarlyAccessPricesFormatted
const mockUseSalesTrialRevampMilestone = assumeMock(
    useSalesTrialRevampMilestone,
)
const mockUseShoppingAssistantTrialFlow = assumeMock(
    useShoppingAssistantTrialFlow,
)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseUpgradePlan = assumeMock(useUpgradePlan)

// Helper function to generate trial end time based on remaining days
const getTrialEndTime = (remainingDays: number): string => {
    return moment().add(remainingDays, 'days').toISOString()
}

const defaultMockUseShoppingAssistantTrialFlow = {
    openManageTrialModal: jest.fn(),
    openUpgradePlanModal: jest.fn(),
    openTrialUpgradeModal: jest.fn(),
    closeManageTrialModal: jest.fn(),
    closeTrialUpgradeModal: jest.fn(),
    closeUpgradePlanModal: jest.fn(),
    closeSuccessModal: jest.fn(),
    startTrial: jest.fn(),
    onConfirmTrial: jest.fn(),
    isLoading: false,
    isTrialModalOpen: false,
    isSuccessModalOpen: false,
    isManageTrialModalOpen: false,
    isUpgradePlanModalOpen: false,
    onDismissTrialUpgradeModal: jest.fn(),
    onDismissUpgradePlanModal: jest.fn(),
    revampStartTrial: jest.fn(),
    isTrialFinishSetupModalOpen: false,
    closeTrialFinishSetupModal: jest.fn(),
    openTrialFinishSetupModal: jest.fn(),
    isTrialRequestModalOpen: false,
    openTrialRequestModal: jest.fn(),
    closeTrialRequestModal: jest.fn(),
    onRequestTrialExtension: jest.fn(),
}

describe('useTrialModalProps', () => {
    function renderHookWithRouter<T>(
        callback: (...args: any[]) => T,
        options?: any,
    ) {
        const history = createMemoryHistory({ initialEntries: ['/'] })
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(
                QueryClientProvider,
                { client: queryClient },
                React.createElement(
                    Router,
                    { history },
                    React.createElement(Route, { path: '/' }, children),
                ),
            )
        return renderHook(callback, { wrapper, ...options })
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock useAppDispatch
        mockUseAppDispatch.mockReturnValue(jest.fn())

        // Mock useUpgradePlan
        mockUseUpgradePlan.mockReturnValue({
            upgradePlan: jest.fn(),
            upgradePlanAsync: jest.fn(),
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        })

        // Default mock implementations
        mockGetAutomateEarlyAccessPricesFormatted.mockReturnValue({
            amount: '$99',
            cadence: 'month',
        })

        mockUseTrialMetrics.mockReturnValue({
            gmvInfluenced: '$25',
            gmvInfluencedRate: 0.05, // Greater than 0.01 to show personalized content
            isLoading: false,
        })

        mockUseTrialEnding.mockReturnValue({
            remainingDays: 14,
            remainingDaysFloat: 14.0,
            trialEndDatetime: getTrialEndTime(14),
            trialTerminationDatetime: null,
            optedOutDatetime: undefined,
        })

        mockUseShoppingAssistantTrialAccess.mockReturnValue({
            hasAnyTrialStarted: false,
            canBookDemo: false,
            canSeeSystemBanner: false,
            canSeeTrialCTA: false,
            canNotifyAdmin: false,
            hasCurrentStoreTrialStarted: false,
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
            hasCurrentStoreTrialExpired: false,
            hasAnyTrialExpired: false,
            hasAnyTrialOptedIn: false,
            hasAnyTrialActive: false,
        })

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')

        mockUseAppSelector.mockReturnValue(
            fromJS({
                domain: 'test-domain.com',
                role: {
                    name: 'admin',
                },
            }),
        )

        mockUseStoreActivations.mockReturnValue({
            storeActivations: {
                store1: {
                    name: 'store1',
                    title: 'Store 1',
                    alerts: [],
                    configuration: {} as any,
                    sales: {
                        enabled: false,
                        isDisabled: false,
                    },
                    support: {
                        enabled: true,
                        chat: {
                            enabled: true,
                        },
                        email: {
                            enabled: true,
                        },
                    },
                    isMissingKnowledge: false,
                },
                store2: {
                    name: 'store2',
                    title: 'Store 2',
                    alerts: [],
                    configuration: {} as any,
                    sales: {
                        enabled: true,
                        isDisabled: false,
                    },
                    support: {
                        enabled: true,
                        chat: {
                            enabled: true,
                        },
                        email: {
                            enabled: true,
                        },
                    },
                    isMissingKnowledge: false,
                },
            },
            progressPercentage: 50,
            isFetchLoading: false,
            isSaveLoading: false,
            changeSales: jest.fn(),
            changeSupport: jest.fn(),
            changeSupportChat: jest.fn(),
            changeSupportEmail: jest.fn(),
            saveStoreConfigurations: jest.fn(),
            migrateToNewPricing: jest.fn(),
            endTrial: jest.fn(),
            activation: jest.fn(),
        })

        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            defaultMockUseShoppingAssistantTrialFlow,
        )
    })

    describe('useTrialUpgradePlanModal', () => {
        it('should return correct modal props with billing state', () => {
            const mockBillingState = {
                data: {
                    current_plans: {
                        automate: {
                            amount: 5000, // $50 in cents
                            currency: 'USD',
                            num_quota_tickets: 100,
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

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal).toEqual({
                title: 'Try the full power of AI Agent for 14 days at no additional cost',
                currentPlan: {
                    title: 'AI Agent',
                    description: 'Provide best-in-class automated support',
                    price: '$50',
                    billingPeriod: 'month',
                    features: [
                        {
                            isError: false,
                            label: '100 automated interactions',
                        },
                        {
                            isError: false,
                            label: 'Deliver instant answers to repetitive questions and improve customer satisfaction',
                        },
                        {
                            isError: false,
                            label: 'Automatically handle orders, returns, and subscriptions quickly, 24/7',
                        },
                        {
                            isError: true,
                            label: 'Advanced sales skills',
                        },
                    ],
                    buttonText: 'Keep current plan',
                },
                newPlan: {
                    title: 'AI Agent with Shopping Assistant',
                    description:
                        'Power up AI Agent with new advanced sales skills',
                    price: '$99',
                    billingPeriod: 'month after trial ends',
                    features: [
                        {
                            isError: false,
                            label: 'Everything in Support Agent skills',
                        },
                        {
                            isError: false,
                            label: 'Proactively engage with shoppers at key moments',
                        },
                        {
                            isError: false,
                            label: 'Personalize product recommendations powered by rich customer insights',
                        },
                        {
                            isError: false,
                            label: 'Offer discounts based on purchase intent',
                        },
                    ],
                    buttonText: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
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

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal.currentPlan.price).toBe(
                '$0',
            )
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

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(
                result.current.trialUpgradePlanModal.newPlan.priceTooltipText,
            ).toContain('$0 helpdesk fee')
        })

        it('should handle null billing state', () => {
            mockUseBillingState.mockReturnValue({ data: null } as any)
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { amount: 9900 },
            } as any)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal.currentPlan.price).toBe(
                '$0',
            )
            expect(
                result.current.trialUpgradePlanModal.newPlan.priceTooltipText,
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

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

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
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.05, // Greater than 0.01 to show personalized content
                isLoading: false,
            })

            mockUseTrialEnding.mockReturnValue({
                remainingDays: 7,
                remainingDaysFloat: 7.0,
                trialEndDatetime: getTrialEndTime(7),
                trialTerminationDatetime: null,
                optedOutDatetime: undefined,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialStartedBanner).toEqual({
                title: 'Your Shopping Assistant trial ends in 7 days.',
                description:
                    "So far, it's influenced $25 of GMV for your store.",
                primaryAction: expect.objectContaining({
                    label: 'Upgrade Now',
                    onClick: expect.any(Function),
                }),
                secondaryAction: expect.objectContaining({
                    label: 'Manage Trial',
                    onClick: expect.any(Function),
                }),
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

            const { result, rerender } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            // Initial values
            expect(result.current.trialStartedBanner.title).toBe(
                'Your Shopping Assistant trial ends in 14 days.',
            )

            // Update metrics
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$50',
                gmvInfluencedRate: 0.05, // Greater than 0.01 to show personalized content
                isLoading: false,
            })

            mockUseTrialEnding.mockReturnValue({
                remainingDays: 3,
                remainingDaysFloat: 3.0,
                trialEndDatetime: getTrialEndTime(3),
                trialTerminationDatetime: null,
                optedOutDatetime: undefined,
            })

            rerender()

            expect(result.current.trialStartedBanner).toEqual({
                title: 'Your Shopping Assistant trial ends in 3 days.',
                description:
                    "So far, it's influenced $50 of GMV for your store.",
                primaryAction: expect.objectContaining({
                    label: 'Upgrade Now',
                    onClick: expect.any(Function),
                }),
                secondaryAction: expect.objectContaining({
                    label: 'Manage Trial',
                    onClick: expect.any(Function),
                }),
            })
        })

        describe('remainingDays text formatting', () => {
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

            it('should display "ends today" when remainingDays is 0', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })

                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 0,
                    remainingDaysFloat: 0.0,
                    trialEndDatetime: getTrialEndTime(0),
                    trialTerminationDatetime: null,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialStartedBanner.title).toBe(
                    'Your Shopping Assistant trial ends today.',
                )
            })

            it('should display "ends today" when remainingDays is negative', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })

                mockUseTrialEnding.mockReturnValue({
                    remainingDays: -1,
                    remainingDaysFloat: -1.0,
                    trialEndDatetime: getTrialEndTime(-1),
                    trialTerminationDatetime: null,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialStartedBanner.title).toBe(
                    'Your Shopping Assistant trial ends today.',
                )
            })

            it('should display "ends in 1 day" when remainingDays is 1', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })

                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 1,
                    remainingDaysFloat: 1.0,
                    trialEndDatetime: getTrialEndTime(1),
                    trialTerminationDatetime: null,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialStartedBanner.title).toBe(
                    'Your Shopping Assistant trial ends in 1 day.',
                )
            })

            it('should display "ends in X days" when remainingDays is greater than 1', () => {
                const testCases = [
                    {
                        remainingDays: 2,
                        remainingDaysFloat: 2.0,
                        expected: 'ends in 2 days',
                    },
                    {
                        remainingDays: 5,
                        remainingDaysFloat: 5.0,
                        expected: 'ends in 5 days',
                    },
                    {
                        remainingDays: 10,
                        remainingDaysFloat: 10.0,
                        expected: 'ends in 10 days',
                    },
                    {
                        remainingDays: 14,
                        remainingDaysFloat: 14.0,
                        expected: 'ends in 14 days',
                    },
                    {
                        remainingDays: 30,
                        remainingDaysFloat: 30.0,
                        expected: 'ends in 30 days',
                    },
                ]

                testCases.forEach(({ remainingDays, expected }) => {
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.05,
                        isLoading: false,
                    })

                    mockUseTrialEnding.mockReturnValue({
                        remainingDays,
                        remainingDaysFloat: remainingDays,
                        trialEndDatetime: getTrialEndTime(remainingDays),
                        trialTerminationDatetime: null,
                        optedOutDatetime: undefined,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    expect(result.current.trialStartedBanner.title).toBe(
                        `Your Shopping Assistant trial ${expected}.`,
                    )
                })
            })

            it('should handle edge case with very large remainingDays', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })

                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 365,
                    remainingDaysFloat: 365.0,
                    trialEndDatetime: getTrialEndTime(365),
                    trialTerminationDatetime: null,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialStartedBanner.title).toBe(
                    'Your Shopping Assistant trial ends in 365 days.',
                )
            })

            it('should update title text when remainingDays changes dynamically', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })

                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 5,
                    remainingDaysFloat: 5.0,
                    trialEndDatetime: getTrialEndTime(5),
                    trialTerminationDatetime: null,
                    optedOutDatetime: undefined,
                })

                const { result, rerender } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                // Initial state
                expect(result.current.trialStartedBanner.title).toBe(
                    'Your Shopping Assistant trial ends in 5 days.',
                )

                // Update to 1 day
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })

                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 1,
                    remainingDaysFloat: 1.0,
                    trialEndDatetime: getTrialEndTime(1),
                    trialTerminationDatetime: null,
                    optedOutDatetime: undefined,
                })
                rerender()

                expect(result.current.trialStartedBanner.title).toBe(
                    'Your Shopping Assistant trial ends in 1 day.',
                )

                // Update to 0 days
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })

                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 0,
                    remainingDaysFloat: 0.0,
                    trialEndDatetime: getTrialEndTime(0),
                    trialTerminationDatetime: null,
                    optedOutDatetime: undefined,
                })
                rerender()

                expect(result.current.trialStartedBanner.title).toBe(
                    'Your Shopping Assistant trial ends today.',
                )
            })
        })

        describe('primaryAction based on earlyAccessPlan', () => {
            beforeEach(() => {
                mockUseBillingState.mockReturnValue({
                    data: {
                        current_plans: {
                            automate: { amount: 5000, currency: 'USD' },
                            helpdesk: { amount: 10000, num_quota_tickets: 100 },
                        },
                    },
                } as any)
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    trialEndDatetime: getTrialEndTime(7),
                    trialTerminationDatetime: null,
                    optedOutDatetime: undefined,
                })
            })

            it('should return undefined primaryAction when earlyAccessPlan is null', () => {
                mockUseEarlyAccessAutomatePlan.mockReturnValue({
                    data: null,
                } as any)
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    hasAnyTrialStarted: false,
                    canBookDemo: false,
                    canSeeSystemBanner: false,
                    canSeeTrialCTA: false,
                    canNotifyAdmin: false,
                    hasCurrentStoreTrialOptedOut: false,
                    hasAnyTrialOptedOut: false,
                    hasAnyTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    hasAnyTrialActive: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(
                    result.current.trialStartedBanner.primaryAction,
                ).toBeUndefined()
            })

            it('should return primaryAction when earlyAccessPlan has value', () => {
                mockUseEarlyAccessAutomatePlan.mockReturnValue({
                    data: { amount: 9900 },
                } as any)
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    hasAnyTrialStarted: false,
                    canBookDemo: false,
                    canSeeSystemBanner: false,
                    canSeeTrialCTA: false,
                    canNotifyAdmin: false,
                    hasCurrentStoreTrialOptedOut: false,
                    hasAnyTrialOptedOut: false,
                    hasAnyTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    hasAnyTrialActive: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialStartedBanner.primaryAction).toEqual(
                    {
                        label: 'Upgrade Now',
                        onClick: expect.any(Function),
                        isLoading: false,
                    },
                )
            })

            it('should return Book a demo when canBookDemo is true regardless of earlyAccessPlan', () => {
                mockUseEarlyAccessAutomatePlan.mockReturnValue({
                    data: null,
                } as any)
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    hasAnyTrialStarted: false,
                    canBookDemo: true,
                    canSeeSystemBanner: false,
                    canSeeTrialCTA: false,
                    canNotifyAdmin: false,
                    hasCurrentStoreTrialOptedOut: false,
                    hasAnyTrialOptedOut: false,
                    hasAnyTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    hasAnyTrialActive: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialStartedBanner.primaryAction).toEqual(
                    {
                        label: 'Book a demo',
                        onClick: expect.any(Function),
                    },
                )
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
                hasAnyTrialStarted: false,
                canBookDemo: true,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialAlertBanner).toEqual({
                title: 'Influence +1.5% GMV with Shopping Assistant',
                description:
                    'Increase customer engagement and turn every interaction into a sale. With AI Agent’s new shopping assistant features, you can deliver personalized recommendations and offer intent-based discounts that convert.',
                primaryAction: {
                    label: 'Book a demo',
                    onClick: expect.any(Function),
                },
                secondaryAction: {
                    label: 'How AI Agent can 2x conversion rate',
                    onClick: expect.any(Function),
                },
            })
        })

        it('should return correct alert banner when user cannot book demo', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialAlertBanner.secondaryAction).toEqual({
                label: 'How AI Agent can 2x conversion rate',
                onClick: expect.any(Function),
            })
        })

        it('should call onConfirmTrial when primary action is clicked', () => {
            const mockOnConfirmTrial = jest.fn()

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ onConfirmTrial: mockOnConfirmTrial }),
            )

            result.current.trialAlertBanner.primaryAction?.onClick()

            expect(mockOnConfirmTrial).toHaveBeenCalled()
        })

        it('should open demo link when "Book a demo" is clicked', () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: true,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            result.current.trialAlertBanner.primaryAction?.onClick()

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://www.gorgias.com/demo/customers/automate',
                '_blank',
            )
        })

        it('should open shopping assistant page when growth link is clicked', () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            result.current.trialAlertBanner.secondaryAction?.onClick()

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://www.gorgias.com/ai-agent/shopping-assistant',
                '_blank',
            )
        })

        it('should provide default empty function when onConfirmTrial is not provided', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            // Should not throw when called
            expect(() => {
                result.current.trialAlertBanner.primaryAction?.onClick()
            }).not.toThrow()
        })
    })

    describe('handleUpgradePlan callback', () => {
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

        it('should call openUpgradePlanModal and log event when hasOptedOut is true', () => {
            const mockOpenUpgradePlanModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                openUpgradePlanModal: mockOpenUpgradePlanModal,
            })

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: true,
                hasAnyTrialOptedOut: true,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            // Call the handleUpgradePlan function
            result.current.trialStartedBanner.primaryAction?.onClick()

            expect(mockOpenUpgradePlanModal).toHaveBeenCalled()
        })

        it('should call openUpgradePlanModal and log event when hasActiveTrial is false', () => {
            const mockOpenUpgradePlanModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                openUpgradePlanModal: mockOpenUpgradePlanModal,
            })

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            // Call the handleUpgradePlan function
            result.current.trialStartedBanner.primaryAction?.onClick()

            expect(mockOpenUpgradePlanModal).toHaveBeenCalled()
        })

        it('should call upgradePlan when hasActiveTrial is true and hasOptedOut is false', () => {
            const mockUpgradePlanAsync = jest.fn()

            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: jest.fn(),
                upgradePlanAsync: mockUpgradePlanAsync,
                isLoading: false,
                error: null,
                isSuccess: false,
                isError: false,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                defaultMockUseShoppingAssistantTrialFlow,
            )

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: true,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: true,
                hasAnyTrialActive: true,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            // Call the handleUpgradePlan function
            result.current.trialStartedBanner.primaryAction?.onClick()

            expect(mockUpgradePlanAsync).toHaveBeenCalled()
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

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal.currentPlan.price).toBe(
                '€50',
            )
            expect(
                result.current.trialUpgradePlanModal.newPlan.priceTooltipText,
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

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal.currentPlan.price).toBe(
                '$0',
            )
            expect(
                result.current.trialUpgradePlanModal.newPlan.priceTooltipText,
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

            const { result, rerender } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            const firstResult = result.current

            // Rerender without changing dependencies
            rerender()

            // The hook returns a new object each time due to the wrapper useMemo
            // But the individual properties should have stable references
            expect(result.current.upgradePlanModal).toEqual(
                firstResult.upgradePlanModal,
            )
            expect(result.current.trialUpgradePlanModal).toEqual(
                firstResult.trialUpgradePlanModal,
            )
            expect(result.current.trialActivatedModal).toEqual(
                firstResult.trialActivatedModal,
            )
            expect(result.current.trialEndingModal).toEqual(
                firstResult.trialEndingModal,
            )
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

            const { result, rerender } = renderHookWithRouter(
                ({ onConfirmTrial }: { onConfirmTrial: jest.Mock }) =>
                    useTrialModalProps({ onConfirmTrial }),
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

    describe('hasOptedOut scenarios', () => {
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

        it('should handle when user has opted out of trial', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: true,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: true,
                hasAnyTrialOptedOut: true,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal).toBeDefined()
            expect(result.current.trialActivatedModal).toBeDefined()
            expect(result.current.trialStartedBanner).toBeDefined()
            expect(result.current.trialAlertBanner).toBeDefined()
        })

        it('should maintain consistent modal props when hasOptedOut changes', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: true,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result, rerender } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            const initialResult = result.current

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: true,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: true,
                hasAnyTrialOptedOut: true,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            rerender()

            expect(result.current.trialUpgradePlanModal.title).toBe(
                initialResult.trialUpgradePlanModal.title,
            )
            expect(result.current.trialActivatedModal.title).toBe(
                initialResult.trialActivatedModal.title,
            )
        })
    })

    describe('useTrialEndedModal description', () => {
        const HIGH_GMV_RATE = 0.06
        const GMV_INFLUENCED = '$250'

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

        describe('when gmvInfluencedRate > 0.005', () => {
            it('should return personalized message with GMV amount', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: GMV_INFLUENCED,
                    gmvInfluencedRate: HIGH_GMV_RATE,
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndingModal.description).toEqual(
                    expect.objectContaining({
                        type: 'span',
                        props: expect.objectContaining({
                            children: expect.arrayContaining([
                                'Shopping Assistant drove ',
                                expect.objectContaining({
                                    type: 'strong',
                                    props: expect.objectContaining({
                                        children: '$250',
                                    }),
                                }),
                                " uplift in GMV. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
                            ]),
                        }),
                    }),
                )
            })

            it('should handle different GMV amounts in personalized message', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,500',
                    gmvInfluencedRate: 0.08,
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndingModal.description).toEqual(
                    expect.objectContaining({
                        type: 'span',
                        props: expect.objectContaining({
                            children: expect.arrayContaining([
                                'Shopping Assistant drove ',
                                expect.objectContaining({
                                    type: 'strong',
                                    props: expect.objectContaining({
                                        children: '$1,500',
                                    }),
                                }),
                                " uplift in GMV. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
                            ]),
                        }),
                    }),
                )
            })
        })

        describe('when gmvInfluencedRate <= 0.005', () => {
            it('should return generic message for rates slightly below threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: GMV_INFLUENCED,
                    gmvInfluencedRate: 0.003,
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndingModal.description).toBe(
                    "Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
                )
            })
        })
    })

    describe('useTrialEndedModal secondaryDescription', () => {
        const HIGHER_GMV_RATE = 0.008
        const LOWER_GMV_RATE = 0.003

        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: {
                    current_plans: {
                        automate: { amount: 5000, currency: 'USD' }, // $50
                        helpdesk: { amount: 10000, num_quota_tickets: 100 },
                    },
                },
            } as any)
        })

        describe('when gmvInfluencedRate > 0.005', () => {
            beforeEach(() => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: HIGHER_GMV_RATE,
                    isLoading: false,
                })
            })

            it('should show increase message when difference > 0', () => {
                mockUseEarlyAccessAutomatePlan.mockReturnValue({
                    data: { amount: 9900 }, // $99 > $50
                } as any)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(
                    result.current.trialEndingModal.secondaryDescription,
                ).toBe('With the upgrade, your plan will increase by $49.')
            })

            it('should show same price message when difference <= 0', () => {
                mockUseEarlyAccessAutomatePlan.mockReturnValue({
                    data: { amount: 5000 }, // $50 = $50
                } as any)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(
                    result.current.trialEndingModal.secondaryDescription,
                ).toBe(
                    'With the upgrade, the price of your plan remains the same.',
                )
            })
        })

        describe('when gmvInfluencedRate <= 0.005', () => {
            beforeEach(() => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: LOWER_GMV_RATE,
                    isLoading: false,
                })
            })

            it('should show typical results with increase message when difference > 0', () => {
                mockUseEarlyAccessAutomatePlan.mockReturnValue({
                    data: { amount: 9900 }, // $99 > $50
                } as any)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(
                    result.current.trialEndingModal.secondaryDescription,
                ).toBe(
                    'Typical results achieved by merchants. After upgrading, your plan will increase by $49.',
                )
            })

            it('should show typical results with same price message when difference <= 0', () => {
                mockUseEarlyAccessAutomatePlan.mockReturnValue({
                    data: { amount: 5000 }, // $50 = $50
                } as any)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(
                    result.current.trialEndingModal.secondaryDescription,
                ).toBe(
                    'Typical results achieved by merchants. The price of your plan remains the same after the upgrade.',
                )
            })
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

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal.newPlan.price).toBe(
                '$0',
            )
        })
    })

    describe('useTrialFinishSetupModal', () => {
        const mockStoreName = 'test-store'

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

        it('should return correct modal props', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: true,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            const modal = result.current.trialFinishSetupModal

            expect(modal.title).toBe(
                'Ready. Set. Grow. Your 14-days trial starts now.',
            )
            expect(modal.subtitle).toBe("Let's unlock its full potential.")
            expect(modal.content).toBe(
                'Just two simple steps to increase conversions and make the most of your trial.',
            )
            expect(modal.primaryAction?.label).toBe('Finish setup')
        })

        it('should call closeTrialFinishSetupModal when primary action is clicked', () => {
            const mockCloseTrialFinishSetupModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                closeTrialFinishSetupModal: mockCloseTrialFinishSetupModal,
            } as unknown as UseShoppingAssistantTrialFlowReturn)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            result.current.trialFinishSetupModal?.primaryAction?.onClick()

            expect(mockCloseTrialFinishSetupModal).toHaveBeenCalledTimes(1)
        })
    })

    describe('useNewTrialUpgradePlanModal', () => {
        const mockStoreName = 'test-store'

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

        it('should return correct modal props', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                hasAnyTrialStarted: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: true,
                canNotifyAdmin: false,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialActive: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            const modal = result.current.newTrialUpgradePlanModal

            expect(modal.title).toBe(
                'Unlock new AI Agent skills at no extra cost',
            )
            expect(modal.subtitle).toBe(
                "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%.",
            )
            expect(modal.primaryAction?.label).toBe('Start trial now')
        })

        it('should call revampStartTrial when primary action is clicked', () => {
            const mockRevampStartTrial = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                revampStartTrial: mockRevampStartTrial,
            } as unknown as UseShoppingAssistantTrialFlowReturn)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            result.current.newTrialUpgradePlanModal?.primaryAction?.onClick()

            expect(mockRevampStartTrial).toHaveBeenCalledTimes(1)
        })
    })
})
