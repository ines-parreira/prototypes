import * as React from 'react'

import { useFlag } from '@repo/feature-flags'
import * as segment from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'
import { MemoryRouter, Route } from 'react-router-dom'

import { earlyAccessMonthlyAutomationPlan } from 'fixtures/plans'
import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { OPPORTUNITIES } from 'pages/aiAgent/constants'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { getUseTrialEndingFixture } from 'pages/aiAgent/fixtures/useTrialEnding.fixture'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useAiAgentTrialOnboarding } from 'pages/aiAgent/trial/hooks/useAiAgentTrialOnboarding'
import { useNotifyAdmins } from 'pages/aiAgent/trial/hooks/useNotifyAdmins'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import type { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { trial } from 'pages/settings/new_billing/fixtures'

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
}))
jest.mock('models/billing/queries')
jest.mock('pages/aiAgent/trial/hooks/useTrialMetrics')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('hooks/useAppSelector')
jest.mock('hooks/useAppDispatch')
jest.mock('pages/aiAgent/trial/hooks/useNotifyAdmins')
jest.mock('hooks/aiAgent/useAiAgentUpgradePlan')
jest.mock('pages/aiAgent/trial/hooks/useAiAgentTrialOnboarding')
jest.mock('@repo/feature-flags')

const mockUseBillingState = assumeMock(useBillingState)
const mockUseAiAgentUpgradePlan = assumeMock(useAiAgentUpgradePlan)
const mockUseTrialMetrics = assumeMock(useTrialMetrics)
const mockUseTrialEnding = assumeMock(useTrialEnding)
const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockUseTrialAccess = assumeMock(useTrialAccess)
const mockUseSalesTrialRevampMilestone = assumeMock(
    useSalesTrialRevampMilestone,
)
const mockUseShoppingAssistantTrialFlow = assumeMock(
    useShoppingAssistantTrialFlow,
)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseUpgradePlan = assumeMock(useUpgradePlan)
const mockUseNotifyAdmins = assumeMock(useNotifyAdmins)
const mockUseAiAgentTrialOnboarding = assumeMock(useAiAgentTrialOnboarding)
const mockUseFlag = assumeMock(useFlag)
const mockLogEvent = jest
    .spyOn(segment, 'logEvent')
    .mockImplementation(jest.fn())

// Helper function to generate trial end time based on remaining days
const getTrialEndTime = (remainingDays: number): string => {
    return moment().add(remainingDays, 'days').toISOString()
}

// Helper function to setup mockUseStoreActivations with default values
const setupMockStoreActivations = (
    overrides: Partial<ReturnType<typeof useStoreActivations>> = {},
) => {
    const defaultValues = {
        storeActivations: {},
        allStoreActivations: {},
        progressPercentage: 0,
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
    }

    mockUseStoreActivations.mockReturnValue({
        ...defaultValues,
        ...overrides,
    })
}

const defaultMockUseShoppingAssistantTrialFlow =
    getUseShoppingAssistantTrialFlowFixture()

describe('useTrialModalProps', () => {
    function renderHookWithRouter<T>(
        callback: (...args: any[]) => T,
        options?: any,
    ) {
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
                    MemoryRouter,
                    { initialEntries: ['/'] },
                    React.createElement(Route, { path: '/' }, children),
                ),
            )
        return renderHook(callback, { wrapper, ...options })
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock logEvent
        mockLogEvent.mockClear()

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
        mockUseTrialMetrics.mockReturnValue({
            gmvInfluenced: '$25',
            gmvInfluencedRate: 0.05, // Greater than 0.01 to show personalized content
            isLoading: false,
        })

        mockUseTrialEnding.mockReturnValue(
            getUseTrialEndingFixture({
                trialEndDatetime: getTrialEndTime(14),
            }),
        )

        mockUseTrialAccess.mockReturnValue(createMockTrialAccess())

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')

        // Mock useFlag to return false by default
        mockUseFlag.mockReturnValue(false)

        mockUseAppSelector.mockImplementation((selector) => {
            // The Shopify selector appears as "memoized" due to memoization wrapper
            if (selector && selector.name === 'memoized') {
                return [] // Default to empty array (no stores)
            }
            // Otherwise return the account state
            return fromJS({
                domain: 'test-domain.com',
                role: {
                    name: 'admin',
                },
            })
        })

        setupMockStoreActivations({
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
        })

        // Remove useStoreConfigurations mock as it's no longer used

        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            defaultMockUseShoppingAssistantTrialFlow,
        )

        mockUseNotifyAdmins.mockReturnValue({
            handleNotifyAdmins: jest.fn(),
            accountAdmins: [],
            isLoading: false,
            isDisabled: false,
        })

        mockUseAiAgentTrialOnboarding.mockReturnValue({
            startOnboardingWizard: jest.fn(),
        })
    })

    describe('useTrialUpgradePlanModal', () => {
        it('should return correct modal props with billing state', () => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal).toEqual({
                title: 'Try the full power of AI Agent for 14 days at no additional cost',
                currentPlan: {
                    title: 'AI Agent',
                    description: 'Provide best-in-class automated support',
                    price: '$180',
                    currency: 'usd',
                    billingPeriod: Cadence.Month,
                    features: [
                        {
                            isError: false,
                            label: '30 automated interactions',
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
                    title: 'AI Agent + Shopping Assistant',
                    description:
                        'Add powerful conversion features to your support flow',
                    price: '$30',
                    currency: 'usd',
                    billingPeriod: Cadence.Month,
                    features: [
                        {
                            isError: false,
                            label: 'Everything in your current plan',
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
                            label: 'Maximize cart size with intelligent upsells',
                            isError: false,
                        },
                        {
                            isError: false,
                            label: 'Offer discounts based on purchase intent',
                        },
                    ],
                    buttonText: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                    priceTooltipText:
                        'Once you upgrade, each support or sales interaction will cost $1 per resolution, plus a $0.18 helpdesk fee.',
                },
            })
        })

        it('should handle missing automate plan by showing $0 price', () => {
            const mockBillingState = {
                data: {
                    ...trial,
                    current_plans: {
                        ...trial.current_plans,
                        automate: null,
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal.currentPlan.price).toBe(
                '$0',
            )
        })

        it('should handle missing helpdesk plan by showing $0 helpdesk fee in tooltip', () => {
            const mockBillingState = {
                data: {
                    ...trial,
                    current_plans: {
                        ...trial.current_plans,
                        helpdesk: null,
                    },
                },
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(
                result.current.trialUpgradePlanModal.newPlan.priceTooltipText,
            ).toContain('$0 helpdesk fee')
        })

        it('should handle null billing state by showing $0 price and $0 helpdesk fee', () => {
            mockUseBillingState.mockReturnValue({
                data: null,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
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
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
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
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)

            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.05, // Greater than 0.01 to show personalized content
                isLoading: false,
            })

            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    trialEndDatetime: getTrialEndTime(7),
                }),
            )

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
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
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

            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    remainingDays: 3,
                    remainingDaysFloat: 3.0,
                    trialEndDatetime: getTrialEndTime(3),
                }),
            )

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
                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: { amount: 9900 },
                } as any)
            })

            it('should display "ends today" when remainingDays is 0', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.05,
                    isLoading: false,
                })

                mockUseTrialEnding.mockReturnValue(
                    getUseTrialEndingFixture({
                        remainingDays: 0,
                        remainingDaysFloat: 0.0,
                        trialEndDatetime: getTrialEndTime(0),
                    }),
                )

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

                mockUseTrialEnding.mockReturnValue(
                    getUseTrialEndingFixture({
                        remainingDays: -1,
                        remainingDaysFloat: -1.0,
                        trialEndDatetime: getTrialEndTime(-1),
                    }),
                )

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

                mockUseTrialEnding.mockReturnValue(
                    getUseTrialEndingFixture({
                        remainingDays: 1,
                        remainingDaysFloat: 1.0,
                        trialEndDatetime: getTrialEndTime(1),
                    }),
                )

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

                    mockUseTrialEnding.mockReturnValue(
                        getUseTrialEndingFixture({
                            remainingDays,
                            remainingDaysFloat: remainingDays,
                            trialEndDatetime: getTrialEndTime(remainingDays),
                        }),
                    )

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

                mockUseTrialEnding.mockReturnValue(
                    getUseTrialEndingFixture({
                        remainingDays: 365,
                        remainingDaysFloat: 365.0,
                        trialEndDatetime: getTrialEndTime(365),
                    }),
                )

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

                mockUseTrialEnding.mockReturnValue(
                    getUseTrialEndingFixture({
                        remainingDays: 5,
                        remainingDaysFloat: 5.0,
                        trialEndDatetime: getTrialEndTime(5),
                    }),
                )

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

                mockUseTrialEnding.mockReturnValue(
                    getUseTrialEndingFixture({
                        remainingDays: 1,
                        remainingDaysFloat: 1.0,
                        trialEndDatetime: getTrialEndTime(1),
                    }),
                )
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

                mockUseTrialEnding.mockReturnValue(
                    getUseTrialEndingFixture({
                        remainingDays: 0,
                        remainingDaysFloat: 0.0,
                        trialEndDatetime: getTrialEndTime(0),
                    }),
                )
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
                    isTrialExtended: false,
                    trialEndDatetime: getTrialEndTime(7),
                    trialTerminationDatetime: null,
                    optedOutDatetime: null,
                })
            })

            it('should return undefined primaryAction when earlyAccessPlan is null', () => {
                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: null,
                } as any)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(
                    result.current.trialStartedBanner.primaryAction,
                ).toBeUndefined()
            })

            it('should return primaryAction when earlyAccessPlan has value', () => {
                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: { amount: 9900 },
                } as any)

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

            it('should return Book a demo when canBookDemo is true regardless of earlyAccessPlan', async () => {
                const mockWindowOpen = jest.fn()
                global.window.open = mockWindowOpen

                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: null,
                } as any)
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({ canBookDemo: true }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialStartedBanner.primaryAction).toEqual(
                    {
                        label: 'Book a demo',
                        onClick: expect.any(Function),
                    },
                )

                await act(() =>
                    result.current.trialStartedBanner.primaryAction?.onClick(),
                )

                expect(mockWindowOpen).toHaveBeenCalledWith(
                    'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=shop_assistant_paywall',
                    '_blank',
                )
            })
        })
    })

    describe('useTrialAlertBanner', () => {
        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
        })

        it('should return correct alert banner when user can book demo', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({ canBookDemo: true }),
            )

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
            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialAlertBanner.secondaryAction).toEqual({
                label: 'How AI Agent can 2x conversion rate',
                onClick: expect.any(Function),
            })
        })

        it('should call onConfirmTrial when primary action is clicked', async () => {
            const mockOnConfirmTrial = jest.fn()

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ onConfirmTrial: mockOnConfirmTrial }),
            )

            await act(() =>
                result.current.trialAlertBanner.primaryAction?.onClick(),
            )

            expect(mockOnConfirmTrial).toHaveBeenCalled()
        })

        it('should open demo link when "Book a demo" is clicked', async () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({ canBookDemo: true }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            await act(() =>
                result.current.trialAlertBanner.primaryAction?.onClick(),
            )

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=shop_assistant_paywall',
                '_blank',
            )
        })

        it('should open shopping assistant page when growth link is clicked', async () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            await act(() =>
                result.current.trialAlertBanner.secondaryAction?.onClick(),
            )

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
            expect(async () => {
                await act(() =>
                    result.current.trialAlertBanner.primaryAction?.onClick(),
                )
            }).not.toThrow()
        })
    })

    describe('useTrialEndedModal', () => {
        describe('when trialType is ShoppingAssistant', () => {
            it('should return correct trial ended modal props', () => {
                mockUseBillingState.mockReturnValue({
                    data: {
                        ...trial,
                        current_plans: {
                            ...trial.current_plans,
                            automate: {
                                ...trial.current_plans.automate,
                                // N.B. forcing increase in price to get cadence in the secondary description
                                amount: 2000,
                            },
                        },
                    },
                } as any)
                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: earlyAccessMonthlyAutomationPlan,
                } as any)
                // Mock admin user for price information tests
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isAdminUser: true,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )
                expect(result.current.trialEndedModal.title).toEqual(
                    'Your trial has ended — and it made an impact.',
                )
                const descriptionElement = render(
                    <>{result.current.trialEndedModal.description}</>,
                ).container
                expect(descriptionElement.textContent).toEqual(
                    'Shopping Assistant drove $25 uplift in GMV. Keep the momentum going and turn even more visitors into buyers.',
                )
                expect(
                    result.current.trialEndedModal.secondaryDescription,
                ).toEqual(
                    `After your trial, your plan will increase by $10/${Cadence.Month}.`,
                )
                expect(result.current.trialEndedModal.advantages).toEqual([
                    '$25 GMV uplift',
                ])
            })

            it('should handle missing early access automate plan', () => {
                mockUseBillingState.mockReturnValue({
                    data: trial,
                } as any)
                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: null,
                } as any)
                // Mock admin user for price information tests
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isAdminUser: true,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndedModal.title).toEqual(
                    'Your trial has ended — and it made an impact.',
                )
                const descriptionElement = render(
                    <>{result.current.trialEndedModal.description}</>,
                ).container
                expect(descriptionElement.textContent).toEqual(
                    'Shopping Assistant drove $25 uplift in GMV. Keep the momentum going and turn even more visitors into buyers.',
                )
                expect(
                    result.current.trialEndedModal.secondaryDescription,
                ).toEqual(
                    'The price of your plan remains the same after the upgrade.',
                )
                expect(result.current.trialEndedModal.advantages).toEqual([
                    '$25 GMV uplift',
                ])
            })
        })

        describe('when trialType is AiAgent', () => {
            beforeEach(() => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                        isAdminUser: true, // Add admin user for price information tests
                    }),
                )
                mockUseBillingState.mockReturnValue({
                    data: {
                        ...trial,
                        current_plans: {
                            ...trial.current_plans,
                            automate: {
                                ...trial.current_plans.automate,
                                amount: 2000,
                            },
                        },
                    },
                } as any)
                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: earlyAccessMonthlyAutomationPlan,
                } as any)
            })

            it('should return impact title and personalized description when automation rate is significant', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.03,
                    automationRate: {
                        value: 0.65,
                        prevValue: 0.5,
                        isLoading: false,
                    },
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndedModal.title).toEqual(
                    'Your trial has ended — and it made an impact.',
                )
                const descriptionElement = render(
                    <>{result.current.trialEndedModal.description}</>,
                ).container
                expect(descriptionElement.textContent).toEqual(
                    'AI Agent drove 65% automation rate. Upgrade today to drive even greater impact.',
                )
                expect(result.current.trialEndedModal.advantages).toEqual([
                    '65% automation rate',
                ])
                expect(
                    result.current.trialEndedModal.secondaryDescription,
                ).toEqual(
                    `After your trial, your plan will increase by $10/${Cadence.Month}.`,
                )
            })

            it('should return beginning title and generic description when automation rate is not significant', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.03,
                    automationRate: {
                        value: 0.002,
                        prevValue: 0.001,
                        isLoading: false,
                    },
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndedModal.title).toEqual(
                    "Your trial ended — but it's just the beginning.",
                )
                expect(result.current.trialEndedModal.description).toEqual(
                    'Brands that unlock AI Agent see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.',
                )
                expect(result.current.trialEndedModal.advantages).toEqual([
                    '60% support inquiries',
                    '35% faster ticket handling',
                    '62% conversion rate',
                ])
                expect(
                    result.current.trialEndedModal.secondaryDescription,
                ).toEqual(
                    `Typical results achieved by merchants. After upgrading, your plan will increase by $10/${Cadence.Month}.`,
                )
            })

            it('should handle undefined automation rate', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.03,
                    automationRate: undefined,
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndedModal.title).toEqual(
                    "Your trial ended — but it's just the beginning.",
                )
                expect(result.current.trialEndedModal.description).toEqual(
                    'Brands that unlock AI Agent see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.',
                )
                expect(result.current.trialEndedModal.advantages).toEqual([
                    '60% support inquiries',
                    '35% faster ticket handling',
                    '62% conversion rate',
                ])
            })

            it('should handle automation rate exactly at threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.03,
                    automationRate: {
                        value: 0.005,
                        prevValue: 0.003,
                        isLoading: false,
                    },
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndedModal.title).toEqual(
                    "Your trial ended — but it's just the beginning.",
                )
                expect(result.current.trialEndedModal.description).toEqual(
                    'Brands that unlock AI Agent see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.',
                )
            })

            it('should handle automation rate just above threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.03,
                    automationRate: {
                        value: 0.006,
                        prevValue: 0.003,
                        isLoading: false,
                    },
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(result.current.trialEndedModal.title).toEqual(
                    'Your trial has ended — and it made an impact.',
                )
                const descriptionElement = render(
                    <>{result.current.trialEndedModal.description}</>,
                ).container
                expect(descriptionElement.textContent).toEqual(
                    'AI Agent drove 0.6% automation rate. Upgrade today to drive even greater impact.',
                )
            })
        })
    })

    describe('handleUpgradePlan callback', () => {
        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
        })

        it('should call openUpgradePlanModal and log event when hasOptedOut is true', async () => {
            const mockOpenUpgradePlanModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                openUpgradePlanModal: mockOpenUpgradePlanModal,
            })

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasCurrentStoreTrialOptedOut: true,
                    hasAnyTrialOptedOut: true,
                }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            // Call the handleUpgradePlan function
            await act(() =>
                result.current.trialStartedBanner.primaryAction?.onClick(),
            )

            expect(mockOpenUpgradePlanModal).toHaveBeenCalled()
        })

        it('should call openUpgradePlanModal and log event when hasActiveTrial is false', async () => {
            const mockOpenUpgradePlanModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                openUpgradePlanModal: mockOpenUpgradePlanModal,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            // Call the handleUpgradePlan function
            await act(() =>
                result.current.trialStartedBanner.primaryAction?.onClick(),
            )

            expect(mockOpenUpgradePlanModal).toHaveBeenCalled()
        })

        it('should call upgradePlan when hasActiveTrial is true and hasOptedOut is false', async () => {
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

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasAnyTrialStarted: true,
                    hasAnyTrialOptedIn: true,
                    hasAnyTrialActive: true,
                }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            // Call the handleUpgradePlan function
            await act(() =>
                result.current.trialStartedBanner.primaryAction?.onClick(),
            )

            expect(mockUpgradePlanAsync).toHaveBeenCalled()
        })
    })

    describe('currency formatting', () => {
        it('should format amounts with EUR currency correctly in price and tooltip', () => {
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
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
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

        it('should handle zero amounts by showing $0 in price and tooltip', () => {
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
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
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
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
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
                data: trial,
            } as any

            mockUseBillingState.mockReturnValue(mockBillingState)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
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
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
        })

        it('should handle when user has opted out of trial', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialOptedOut: true,
                    hasAnyTrialOptedOut: true,
                }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal).toBeDefined()
            expect(result.current.trialActivatedModal).toBeDefined()
            expect(result.current.trialStartedBanner).toBeDefined()
            expect(result.current.trialAlertBanner).toBeDefined()
        })

        it('should maintain consistent modal props when hasOptedOut changes', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({ canSeeTrialCTA: true }),
            )

            const { result, rerender } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            const initialResult = result.current

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialOptedOut: true,
                    hasAnyTrialOptedOut: true,
                }),
            )

            rerender()

            expect(result.current.trialUpgradePlanModal.title).toBe(
                initialResult.trialUpgradePlanModal.title,
            )
            expect(result.current.trialActivatedModal.title).toBe(
                initialResult.trialActivatedModal.title,
            )
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
            // Mock admin user for these price-related tests
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trialType: TrialType.ShoppingAssistant,
                    isAdminUser: true,
                }),
            )
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
                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: { amount: 9900 }, // $99 > $50
                } as any)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(
                    result.current.trialEndingModal.secondaryDescription,
                ).toBe(
                    `With the upgrade, your plan will increase by $49/${Cadence.Month}.`,
                )
            })

            it('should show same price message when difference <= 0', () => {
                mockUseAiAgentUpgradePlan.mockReturnValue({
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
                mockUseAiAgentUpgradePlan.mockReturnValue({
                    data: { amount: 9900 }, // $99 > $50
                } as any)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({}),
                )

                expect(
                    result.current.trialEndingModal.secondaryDescription,
                ).toBe(
                    `Typical results achieved by merchants. After upgrading, your plan will increase by $49/${Cadence.Month}.`,
                )
            })

            it('should show typical results with same price message when difference <= 0', () => {
                mockUseAiAgentUpgradePlan.mockReturnValue({
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

    describe('useUpgradePlanModal', () => {
        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
        })

        it('should return correct upgrade plan modal props', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.upgradePlanModal).toEqual({
                title: 'Turn every interaction into a sale opportunity',
                currentPlan: expect.objectContaining({
                    title: 'AI Agent',
                    description: 'Provide best-in-class automated support',
                    price: '$180',
                    currency: 'usd',
                    billingPeriod: Cadence.Month,
                    features: expect.arrayContaining([
                        expect.objectContaining({
                            label: '30 automated interactions',
                            isError: false,
                        }),
                        expect.objectContaining({
                            label: 'Advanced sales skills',
                            isError: true,
                        }),
                    ]),
                    buttonText: 'Keep current plan',
                }),
                newPlan: expect.objectContaining({
                    title: 'AI Agent + Shopping Assistant',
                    description:
                        'Add powerful conversion features to your support flow',
                    price: '$30',
                    currency: 'usd',
                    billingPeriod: Cadence.Month,
                    buttonText: 'Upgrade AI Agent',
                    priceTooltipText:
                        expect.stringContaining('$1 per resolution'),
                }),
                isOpen: false,
                onClose: expect.any(Function),
                onConfirm: expect.any(Function),
                onDismiss: expect.any(Function),
                isLoading: false,
            })
        })

        it('should handle modal open state correctly', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                isUpgradePlanModalOpen: true,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.upgradePlanModal.isOpen).toBe(true)
        })

        it('should handle loading state correctly', () => {
            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: jest.fn(),
                upgradePlanAsync: jest.fn(),
                isLoading: true,
                error: null,
                isSuccess: false,
                isError: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.upgradePlanModal.isLoading).toBe(true)
        })

        it('should call closeUpgradePlanModal when onClose is triggered', () => {
            const mockCloseUpgradePlanModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                closeUpgradePlanModal: mockCloseUpgradePlanModal,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            result.current.upgradePlanModal.onClose()

            expect(mockCloseUpgradePlanModal).toHaveBeenCalledTimes(1)
        })

        it('should call onUpgradeClick when onConfirm is triggered', async () => {
            const mockUpgradePlanAsync = jest.fn().mockResolvedValue(undefined)
            const mockCloseAllTrialModals = jest.fn()

            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: jest.fn(),
                upgradePlanAsync: mockUpgradePlanAsync,
                isLoading: false,
                error: null,
                isSuccess: false,
                isError: false,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                closeAllTrialModals: mockCloseAllTrialModals,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            await result.current.upgradePlanModal.onConfirm()

            expect(mockUpgradePlanAsync).toHaveBeenCalledTimes(1)
            expect(mockCloseAllTrialModals).toHaveBeenCalledTimes(1)
        })

        it('should log PricingModalClicked event when onConfirm is triggered', async () => {
            const mockUpgradePlanAsync = jest.fn().mockResolvedValue(undefined)
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: jest.fn(),
                upgradePlanAsync: mockUpgradePlanAsync,
                isLoading: false,
                error: null,
                isSuccess: false,
                isError: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            await result.current.upgradePlanModal.onConfirm()

            expect(consoleSpy).toHaveBeenCalledWith(
                'Track Segment',
                segment.SegmentEvent.PricingModalClicked,
                {
                    type: 'upgraded',
                    trialType: TrialType.ShoppingAssistant,
                },
            )

            consoleSpy.mockRestore()
        })

        it('should handle different trial types correctly', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trialType: TrialType.AiAgent,
                }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.upgradePlanModal.title).toBe(
                'Turn every interaction into a sale opportunity',
            )
        })

        it('should handle missing billing data gracefully', () => {
            mockUseBillingState.mockReturnValue({
                data: null,
            } as any)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.upgradePlanModal.currentPlan.price).toBe('$0')
            expect(result.current.upgradePlanModal.currentPlan.currency).toBe(
                'USD',
            )
        })
    })

    describe('edge cases', () => {
        it('should handle undefined early access plan data by showing $0 price in new plan', () => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: undefined,
            } as any)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialUpgradePlanModal.newPlan.price).toBe(
                '$0',
            )
        })
    })

    describe('useTrialRequestModal', () => {
        const mockStoreName = 'test-store'

        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
        })

        describe('when trialType is ShoppingAssistant', () => {
            it('should return correct modal props for Shopping Assistant', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.trialRequestModal

                expect(modal.title).toBe('Request your admin to start trial')
                expect(modal.subtitle).toBe(
                    'Your Gorgias admins will be notified of your request to start Shopping Assistant trial via both email and an in-app notification.',
                )
                expect(modal.primaryCTALabel).toBe('Notify Admins')
                expect(modal.accountAdmins).toBeDefined()
                expect(modal.onPrimaryAction).toEqual(expect.any(Function))
            })

            it('should call handleNotifyAdmins when onPrimaryAction is called for Shopping Assistant', () => {
                const mockHandleNotifyAdmins = jest.fn()
                const mockCloseTrialRequestModal = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    closeTrialRequestModal: mockCloseTrialRequestModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                mockUseNotifyAdmins.mockReturnValue({
                    handleNotifyAdmins: mockHandleNotifyAdmins,
                    accountAdmins: [],
                    isLoading: false,
                    isDisabled: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                result.current.trialRequestModal.onPrimaryAction()

                expect(mockHandleNotifyAdmins).toHaveBeenCalledTimes(1)
            })
        })

        describe('when trialType is AiAgent', () => {
            it('should return correct modal props for AI Agent', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.trialRequestModal

                expect(modal.title).toBe(
                    'Request your admin to activate AI Agent trial',
                )
                expect(modal.subtitle).toBe(
                    'Your Gorgias admins will be notified of your request via both email and an in-app notification.',
                )
                expect(modal.primaryCTALabel).toBe('Notify Admins')
                expect(modal.accountAdmins).toBeDefined()
                expect(modal.onPrimaryAction).toEqual(expect.any(Function))
            })

            it('should call handleNotifyAdmins when onPrimaryAction is called for AI Agent', () => {
                const mockHandleNotifyAdmins = jest.fn()
                const mockCloseTrialRequestModal = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    closeTrialRequestModal: mockCloseTrialRequestModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                mockUseNotifyAdmins.mockReturnValue({
                    handleNotifyAdmins: mockHandleNotifyAdmins,
                    accountAdmins: [],
                    isLoading: false,
                    isDisabled: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                result.current.trialRequestModal.onPrimaryAction()

                expect(mockHandleNotifyAdmins).toHaveBeenCalledTimes(1)
            })

            it('should call closeTrialRequestModal when hook is used for AI Agent', () => {
                const mockCloseTrialRequestModal = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    closeTrialRequestModal: mockCloseTrialRequestModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                expect(mockUseShoppingAssistantTrialFlow).toHaveBeenCalledWith({
                    accountDomain: 'test-domain.com',
                    storeActivations: expect.any(Object),
                    trialType: TrialType.AiAgent,
                })
            })
        })
    })

    describe('useTrialManageModal', () => {
        const mockStoreName = 'test-store'

        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
        })

        it('should return correct modal props with trial ending props', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            const modal = result.current.trialManageModal

            expect(modal.title).toBe('Manage Shopping Assistant trial')
            expect(modal.onClose).toEqual(expect.any(Function))
            expect(modal.primaryAction).toEqual({
                label: 'Upgrade Now',
                onClick: expect.any(Function),
                isLoading: false,
            })
            expect(modal.secondaryAction).toEqual({
                label: 'Opt Out',
                onClick: expect.any(Function),
            })
        })

        it('should inherit properties from trialEndingModal', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            const modal = result.current.trialManageModal
            const trialEndingModal = result.current.trialEndingModal

            expect(modal.description).toEqual(trialEndingModal.description)
            expect(modal.advantages).toEqual(trialEndingModal.advantages)
            expect(modal.secondaryDescription).toEqual(
                trialEndingModal.secondaryDescription,
            )
        })

        it('should not show primary action when futurePlan is null', () => {
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: null,
            } as any)

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            expect(
                result.current.trialManageModal.primaryAction,
            ).toBeUndefined()
        })

        it('should show loading state in primary action when upgrade is in progress', () => {
            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: jest.fn(),
                upgradePlanAsync: jest.fn(),
                isLoading: true,
                error: null,
                isSuccess: false,
                isError: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            expect(
                result.current.trialManageModal.primaryAction?.isLoading,
            ).toBe(true)
        })

        it('should call closeManageTrialModal when onClose is triggered', () => {
            const mockCloseManageTrialModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                closeManageTrialModal: mockCloseManageTrialModal,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            result.current.trialManageModal.onClose()

            expect(mockCloseManageTrialModal).toHaveBeenCalledTimes(1)
        })

        it('should call upgradePlanAsync and closeAllTrialModals when primary action is clicked', async () => {
            const mockUpgradePlanAsync = jest.fn().mockResolvedValue(undefined)
            const mockCloseAllTrialModals = jest.fn()

            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: jest.fn(),
                upgradePlanAsync: mockUpgradePlanAsync,
                isLoading: false,
                error: null,
                isSuccess: false,
                isError: false,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                closeAllTrialModals: mockCloseAllTrialModals,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            await act(() =>
                result.current.trialManageModal.primaryAction?.onClick(),
            )

            expect(mockUpgradePlanAsync).toHaveBeenCalledTimes(1)
            expect(mockCloseAllTrialModals).toHaveBeenCalledTimes(1)
        })

        it('should log PricingModalClicked event when primary action is clicked', async () => {
            const mockUpgradePlanAsync = jest.fn().mockResolvedValue(undefined)
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: jest.fn(),
                upgradePlanAsync: mockUpgradePlanAsync,
                isLoading: false,
                error: null,
                isSuccess: false,
                isError: false,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            await act(() =>
                result.current.trialManageModal.primaryAction?.onClick(),
            )

            expect(consoleSpy).toHaveBeenCalledWith(
                'Track Segment',
                segment.SegmentEvent.PricingModalClicked,
                {
                    type: 'upgraded',
                    trialType: TrialType.ShoppingAssistant,
                },
            )

            consoleSpy.mockRestore()
        })

        it('should close manage modal and open opt out modal when secondary action is clicked', async () => {
            const mockCloseManageTrialModal = jest.fn()
            const mockOpenTrialOptOutModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                closeManageTrialModal: mockCloseManageTrialModal,
                openTrialOptOutModal: mockOpenTrialOptOutModal,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            await act(() =>
                result.current.trialManageModal.secondaryAction?.onClick(),
            )

            expect(mockCloseManageTrialModal).toHaveBeenCalledTimes(1)
            expect(mockOpenTrialOptOutModal).toHaveBeenCalledTimes(1)
        })

        it('should handle different trial types correctly', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trialType: TrialType.AiAgent,
                }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            expect(result.current.trialManageModal.title).toBe(
                'Manage AI Agent trial',
            )
        })

        it('should pass correct parameters to useShoppingAssistantTrialFlow', () => {
            renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            expect(mockUseShoppingAssistantTrialFlow).toHaveBeenCalledWith({
                accountDomain: 'test-domain.com',
                storeActivations: expect.any(Object),
                trialType: TrialType.ShoppingAssistant,
            })
        })

        it('should handle missing store name gracefully', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialManageModal).toBeDefined()
            expect(result.current.trialManageModal.title).toBe(
                'Manage Shopping Assistant trial',
            )
        })

        describe('when hasSignificantAutomationRateImpact is true (AiAgent trial)', () => {
            beforeEach(() => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                    }),
                )
            })

            it('should show impact-based content when automation rate is above threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.03,
                    automationRate: {
                        value: 0.65,
                        prevValue: 0.5,
                        isLoading: false,
                    },
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.trialManageModal
                expect(modal.title).toBe('Manage AI Agent trial')
                expect(modal.advantages).toEqual(['65% automation rate'])
            })

            it('should show personalized description when automation rate is just above threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.03,
                    automationRate: {
                        value: 0.006,
                        prevValue: 0.003,
                        isLoading: false,
                    },
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.trialManageModal
                expect(modal.advantages).toEqual(['0.6% automation rate'])

                const trialEndingModal = result.current.trialEndingModal
                const descriptionElement = render(
                    <>{trialEndingModal.description}</>,
                ).container
                expect(descriptionElement.textContent).toContain(
                    'AI Agent handled 0.6% of customer inquiries',
                )
                expect(descriptionElement.textContent).toContain(
                    'drove a 3% lift in revenue',
                )
            })

            it('should show typical results when automation rate is at threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$25',
                    gmvInfluencedRate: 0.03,
                    automationRate: {
                        value: 0.005,
                        prevValue: 0.003,
                        isLoading: false,
                    },
                    isLoading: false,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.trialManageModal
                expect(modal.advantages).toEqual([
                    '60% support inquiries',
                    '35% faster ticket handling',
                    '62% conversion rate',
                ])

                const trialEndingModal = result.current.trialEndingModal
                const description = trialEndingModal.description as any
                expect(description?.type).toBe('span')
                expect(
                    description?.props?.children[0].props.children,
                ).toContain(
                    'AI Agent has been working behind the scenes to help your team',
                )
            })
        })
    })

    describe('useNewTrialUpgradePlanModal', () => {
        const mockStoreName = 'test-store'

        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
        })

        describe('when trialType is ShoppingAssistant', () => {
            beforeEach(() => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        canSeeTrialCTA: true,
                        isAdminUser: true,
                        trialType: TrialType.ShoppingAssistant,
                        isOnboarded: true,
                    }),
                )
            })
            it('should return correct modal props', () => {
                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.title).toBe(
                    'Try out shopping assistant skills on your current plan',
                )
                expect(modal.subtitle).toBe(
                    "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%.",
                )
                expect(modal.primaryAction?.label).toBe('Start trial now')
                expect(modal.secondaryAction?.label).toBe('No, thanks')
                expect(modal.currentPlan?.title).toBe('AI Agent')
                expect(modal.newPlan.title).toBe(
                    'AI Agent + Shopping Assistant',
                )
            })

            it('should call startTrial when primary action is clicked', async () => {
                const mockStartTrial = jest.fn()

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    startTrial: mockStartTrial,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(),
                )

                expect(mockStartTrial).toHaveBeenCalledTimes(1)
                expect(mockStartTrial).toHaveBeenCalledWith(undefined)
            })

            it('should call startTrial with optedInForUpgrade parameter when provided', async () => {
                const mockStartTrial = jest.fn()

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    startTrial: mockStartTrial,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(
                        true,
                    ),
                )

                expect(mockStartTrial).toHaveBeenCalledTimes(1)
                expect(mockStartTrial).toHaveBeenCalledWith(true)

                mockStartTrial.mockClear()

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(
                        false,
                    ),
                )

                expect(mockStartTrial).toHaveBeenCalledTimes(1)
                expect(mockStartTrial).toHaveBeenCalledWith(false)
            })
        })

        describe('when trialType is AiAgent', () => {
            it('should return correct modal props for AI Agent trial', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        canSeeTrialCTA: true,
                        isAdminUser: true,
                        trialType: TrialType.AiAgent,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.title).toBe('Try AI Agent')
                expect(modal.subtitle).toBe(
                    'Unlock powerful automation with Gorgias AI Agent. Resolve 60% of support inquiries, proactively engage shoppers, and convert more visitors with 24/7 assistance in your brand voice.',
                )
                expect(modal.primaryAction?.label).toBe('Start Free Trial Now')
                expect(modal.secondaryAction?.label).toBe('No, thanks')
            })

            it('should include correct tooltip for AI Agent trial single store', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        canSeeTrialCTA: true,
                        isAdminUser: true,
                        trialType: TrialType.AiAgent,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.newPlan.priceTooltipText).toContain(
                    'be moved from Helpdesk to Helpdesk + AI Agent plan',
                )
                expect(modal.newPlan.priceTooltipText).toContain(
                    'each support or sales resolution will cost $1',
                )
                expect(modal.newPlan.priceTooltipText).toContain(
                    'plus a $0.18 helpdesk fee',
                )
                expect(modal.newPlan.priceTooltipText).not.toContain(
                    'Upgrade will apply to all stores',
                )
            })

            it('should handle different currencies in AI Agent trial tooltip', () => {
                const mockBillingState = {
                    data: {
                        current_plans: {
                            automate: { amount: 5000, currency: 'EUR' },
                            helpdesk: { amount: 10000, num_quota_tickets: 100 },
                        },
                    },
                } as any

                mockUseBillingState.mockReturnValue(mockBillingState)

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        canSeeTrialCTA: true,
                        isAdminUser: true,
                        trialType: TrialType.AiAgent,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.newPlan.priceTooltipText).toContain(
                    'be moved from Helpdesk to Helpdesk + AI Agent plan',
                )
                expect(modal.newPlan.priceTooltipText).toContain(
                    'each support or sales resolution will cost $1',
                )
                expect(modal.newPlan.priceTooltipText).toContain(
                    'plus a €1 helpdesk fee',
                )
            })

            it('should call startTrial when primary action is clicked for AI Agent', async () => {
                const mockStartTrial = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    startTrial: mockStartTrial,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(),
                )

                expect(mockStartTrial).toHaveBeenCalledTimes(1)
                expect(mockStartTrial).toHaveBeenCalledWith(undefined)
            })

            it('should call startTrial with optedInForUpgrade parameter when provided for AI Agent', async () => {
                const mockStartTrial = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    startTrial: mockStartTrial,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(
                        true,
                    ),
                )

                expect(mockStartTrial).toHaveBeenCalledTimes(1)
                expect(mockStartTrial).toHaveBeenCalledWith(true)

                mockStartTrial.mockClear()

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(
                        false,
                    ),
                )

                expect(mockStartTrial).toHaveBeenCalledTimes(1)
                expect(mockStartTrial).toHaveBeenCalledWith(false)
            })

            it('should call onDismissTrialUpgradeModal when secondary action is clicked for AI Agent', async () => {
                const mockOnDismissTrialUpgradeModal = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    onDismissTrialUpgradeModal: mockOnDismissTrialUpgradeModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.secondaryAction?.onClick(),
                )

                expect(mockOnDismissTrialUpgradeModal).toHaveBeenCalledTimes(1)
            })

            it('should call closeTrialUpgradeModal when onClose is called for AI Agent', () => {
                const mockCloseTrialUpgradeModal = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.AiAgent,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    closeTrialUpgradeModal: mockCloseTrialUpgradeModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                result.current.newTrialUpgradePlanModal?.onClose?.()

                expect(mockCloseTrialUpgradeModal).toHaveBeenCalledTimes(1)
            })
        })

        describe('Primary Action Validation', () => {
            beforeEach(() => {
                jest.clearAllMocks()
            })

            const store = storeActivationFixture()

            describe('for ShoppingAssistant trial type', () => {
                beforeEach(() => {
                    // Mock empty store activations
                    setupMockStoreActivations()
                    mockUseFlag.mockReturnValue(true)
                })
                it('should disable primary action when store activation is not found and ai agent is onboarded', () => {
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            canSeeTrialCTA: true,
                            isAdminUser: true,
                            trialType: TrialType.ShoppingAssistant,
                            isOnboarded: true,
                        }),
                    )

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({ storeName: 'nonexistent-store' }),
                    )

                    const modal = result.current.newTrialUpgradePlanModal

                    expect(modal.primaryAction?.isDisabled).toBe(true)

                    // Check that errorMessage is a JSX element and render it to test content
                    const errorMessage = modal.primaryAction
                        ?.errorMessage as any
                    expect(errorMessage?.type).toBe('span')

                    // Render the error message to test its content
                    const { container } = render(<>{errorMessage}</>)
                    expect(container.textContent).toBe(
                        'AI Agent must be set up for this store to start the trial.',
                    )
                })

                it('should not disable primary action when store activation is not found and ai agent is not onboarded', () => {
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            canSeeTrialCTA: true,
                            isAdminUser: true,
                            trialType: TrialType.ShoppingAssistant,
                            isOnboarded: false,
                        }),
                    )

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({ storeName: 'nonexistent-store' }),
                    )

                    const modal = result.current.newTrialUpgradePlanModal

                    expect(modal.primaryAction?.isDisabled).toBe(false)

                    // Check that errorMessage is a JSX element and render it to test content
                    const errorMessage = modal.primaryAction
                        ?.errorMessage as any
                    expect(errorMessage).toBeUndefined()
                })

                it('should disable primary action when AI agent is onboarded but not deployed on chat or email for store', () => {
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            canSeeTrialCTA: true,
                            isAdminUser: true,
                            trialType: TrialType.ShoppingAssistant,
                            isOnboarded: true,
                        }),
                    )

                    // Mock store activations with AI agent disabled
                    const mockStoreActivations = {
                        'test-store': {
                            ...store,
                            configuration: {
                                ...store.configuration,
                                chatChannelDeactivatedDatetime:
                                    '2023-01-01T00:00:00.000Z',
                                emailChannelDeactivatedDatetime:
                                    '2023-01-01T00:00:00.000Z',
                            },
                        },
                    }

                    setupMockStoreActivations({
                        storeActivations: mockStoreActivations,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({ storeName: 'test-store' }),
                    )

                    const modal = result.current.newTrialUpgradePlanModal

                    expect(modal.primaryAction?.isDisabled).toBe(true)

                    // Check that errorMessage is a JSX element with Link
                    const errorMessage = modal.primaryAction
                        ?.errorMessage as any
                    expect(errorMessage?.type).toBe('span')

                    // Test the JSX structure directly
                    const children = errorMessage?.props?.children
                    expect(children).toHaveLength(4)
                    expect(children?.[0]).toBe(
                        'AI Agent must be set up for this store to start the trial. Make sure AI agent is',
                    )
                    expect(children?.[1]).toBe(' ')
                    // Check for Link component by checking for 'to' prop (unique to Link)
                    expect(children?.[2]?.props?.to).toBe(
                        '/app/ai-agent/shopify/test-store/deploy/chat',
                    )
                    expect(children?.[2]?.props?.children).toBe(
                        'deployed on at least one channel',
                    )
                })

                it('should call onClose when link is clicked', async () => {
                    const mockOnClose = jest.fn()

                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            canSeeTrialCTA: true,
                            isAdminUser: true,
                            trialType: TrialType.ShoppingAssistant,
                            isOnboarded: true,
                        }),
                    )

                    // Mock store activations with AI agent disabled
                    const mockStoreActivations = {
                        'test-store': {
                            ...store,
                            configuration: {
                                ...store.configuration,
                                chatChannelDeactivatedDatetime:
                                    '2023-01-01T00:00:00.000Z',
                                emailChannelDeactivatedDatetime:
                                    '2023-01-01T00:00:00.000Z',
                            },
                        },
                    }

                    setupMockStoreActivations({
                        storeActivations: mockStoreActivations,
                    })

                    // Mock the close function
                    mockUseShoppingAssistantTrialFlow.mockReturnValue({
                        ...defaultMockUseShoppingAssistantTrialFlow,
                        closeTrialUpgradeModal: mockOnClose,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({ storeName: 'test-store' }),
                    )

                    const modal = result.current.newTrialUpgradePlanModal
                    const errorMessage = modal.primaryAction
                        ?.errorMessage as any

                    // Test the Link component's onClick handler directly
                    const children = errorMessage?.props?.children
                    const linkElement = children?.[2] // Link is at index 2

                    // Verify the Link component structure by checking for 'to' prop (unique to Link)
                    expect(linkElement?.props?.to).toBe(
                        '/app/ai-agent/shopify/test-store/deploy/chat',
                    )
                    expect(linkElement?.props?.children).toBe(
                        'deployed on at least one channel',
                    )

                    // Test the onClick handler
                    expect(linkElement?.props?.onClick).toBeDefined()
                    await act(() => linkElement?.props?.onClick())

                    expect(mockOnClose).toHaveBeenCalledTimes(1)
                })

                it('should enable primary action when AI agent is enabled for store', () => {
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            canSeeTrialCTA: true,
                            isAdminUser: true,
                            trialType: TrialType.ShoppingAssistant,
                        }),
                    )

                    // Mock store activations with AI agent enabled (channels not deactivated)
                    const mockStoreActivations = {
                        'test-store': {
                            ...store,
                            configuration: {
                                ...store.configuration,
                                // AI agent is enabled when channels are not deactivated
                                chatChannelDeactivatedDatetime: null,
                                emailChannelDeactivatedDatetime: null,
                            },
                        },
                    }

                    setupMockStoreActivations({
                        storeActivations: mockStoreActivations,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({ storeName: 'test-store' }),
                    )

                    const modal = result.current.newTrialUpgradePlanModal

                    expect(modal.primaryAction?.isDisabled).toBe(false)
                    expect(modal.primaryAction?.errorMessage).toBeUndefined()
                })
            })
        })
    })

    describe('useTrialOptOutModal', () => {
        const mockStoreName = 'test-store'

        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    trialEndDatetime: getTrialEndTime(7),
                }),
            )
        })

        it('should return correct modal props', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            const modal = result.current.trialOptOutModal

            expect(modal.isOpen).toBe(false)
            expect(modal.isTrialExtended).toBe(false)
            expect(modal.trialType).toBe(TrialType.ShoppingAssistant)
            expect(modal.onClose).toEqual(expect.any(Function))
            expect(modal.onRequestTrialExtension).toEqual(expect.any(Function))
        })

        it('should handle when modal is open', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                isTrialOptOutModalOpen: true,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            expect(result.current.trialOptOutModal.isOpen).toBe(true)
        })

        it('should handle when trial is extended', () => {
            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    isTrialExtended: true,
                    trialEndDatetime: getTrialEndTime(7),
                }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            expect(result.current.trialOptOutModal.isTrialExtended).toBe(true)
        })

        it('should handle different trial types', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trialType: TrialType.AiAgent,
                }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            expect(result.current.trialOptOutModal.trialType).toBe(
                TrialType.AiAgent,
            )
        })

        it('should call closeTrialOptOutModal when onClose is triggered', () => {
            const mockCloseTrialOptOutModal = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                closeTrialOptOutModal: mockCloseTrialOptOutModal,
            })

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            result.current.trialOptOutModal.onClose()

            expect(mockCloseTrialOptOutModal).toHaveBeenCalledTimes(1)
        })

        it('should call onRequestTrialExtension with trialEndDatetime when onRequestTrialExtension is triggered', () => {
            const mockOnRequestTrialExtension = jest.fn()
            const testTrialEndDatetime = getTrialEndTime(7)

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                ...defaultMockUseShoppingAssistantTrialFlow,
                onRequestTrialExtension: mockOnRequestTrialExtension,
            })

            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    trialEndDatetime: testTrialEndDatetime,
                }),
            )

            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            result.current.trialOptOutModal.onRequestTrialExtension()

            expect(mockOnRequestTrialExtension).toHaveBeenCalledWith(
                testTrialEndDatetime,
            )
        })

        it('should handle missing store name gracefully', () => {
            const { result } = renderHookWithRouter(() =>
                useTrialModalProps({}),
            )

            expect(result.current.trialOptOutModal).toBeDefined()
            expect(result.current.trialOptOutModal.trialType).toBe(
                TrialType.ShoppingAssistant,
            )
        })

        it('should pass correct parameters to useShoppingAssistantTrialFlow', () => {
            renderHookWithRouter(() =>
                useTrialModalProps({ storeName: mockStoreName }),
            )

            expect(mockUseShoppingAssistantTrialFlow).toHaveBeenCalledWith({
                accountDomain: 'test-domain.com',
                storeActivations: expect.any(Object),
                trialType: TrialType.ShoppingAssistant,
            })
        })
    })

    describe('admin vs non-admin user pricing display', () => {
        const mockBillingStateWithPriceIncrease = {
            data: {
                ...trial,
                current_plans: {
                    ...trial.current_plans,
                    automate: {
                        ...trial.current_plans.automate,
                        amount: 2000, // $20 to force price increase
                    },
                },
            },
        }

        const setupMocks = (isAdmin: boolean) => {
            mockUseBillingState.mockReturnValue(
                mockBillingStateWithPriceIncrease as any,
            )
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: {
                    ...earlyAccessMonthlyAutomationPlan,
                    amount: 3000, // $30 to ensure price increase
                },
            } as any)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trialType: TrialType.ShoppingAssistant,
                    isAdminUser: isAdmin,
                }),
            )
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.03,
                automationRate: {
                    value: 0.65,
                    prevValue: 0.001,
                    isLoading: false,
                },
                isLoading: false,
            })
        }

        describe('trialEndingModal', () => {
            describe('when user is admin', () => {
                it('should show price information in secondaryDescription for significant GMV impact', () => {
                    setupMocks(true) // Admin user
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.04, // Above threshold
                        automationRate: {
                            value: 0.002,
                            prevValue: 0.001,
                            isLoading: false,
                        },
                        isLoading: false,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    expect(
                        result.current.trialEndingModal.secondaryDescription,
                    ).toBe(
                        `With the upgrade, your plan will increase by $10/${Cadence.Month}.`,
                    )
                })

                it('should show price information for non-significant GMV impact', () => {
                    setupMocks(true) // Admin user
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.003, // Below threshold (< 0.005)
                        automationRate: {
                            value: 0.002,
                            prevValue: 0.001,
                            isLoading: false,
                        },
                        isLoading: false,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    // For Shopping Assistant with non-significant impact, it should show "Typical results achieved by merchants" format
                    expect(
                        result.current.trialEndingModal.secondaryDescription,
                    ).toBe(
                        `Typical results achieved by merchants. After upgrading, your plan will increase by $10/${Cadence.Month}.`,
                    )
                })
            })

            describe('when user is not admin', () => {
                it('should hide price information in secondaryDescription for significant GMV impact', () => {
                    setupMocks(false) // Non-admin user
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.04, // Above threshold
                        automationRate: {
                            value: 0.002,
                            prevValue: 0.001,
                            isLoading: false,
                        },
                        isLoading: false,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    expect(
                        result.current.trialEndingModal.secondaryDescription,
                    ).toBe('Typical results achieved by merchants.')
                })

                it('should hide price information for non-significant GMV impact', () => {
                    setupMocks(false) // Non-admin user
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.003, // Below threshold (< 0.005)
                        automationRate: {
                            value: 0.002,
                            prevValue: 0.001,
                            isLoading: false,
                        },
                        isLoading: false,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    expect(
                        result.current.trialEndingModal.secondaryDescription,
                    ).toBe('Typical results achieved by merchants.')
                })
            })
        })

        describe('trialEndedModal', () => {
            describe('when user is admin', () => {
                it('should show price information in secondaryDescription for significant GMV impact', () => {
                    setupMocks(true) // Admin user
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.04, // Above threshold
                        automationRate: {
                            value: 0.002,
                            prevValue: 0.001,
                            isLoading: false,
                        },
                        isLoading: false,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    expect(
                        result.current.trialEndedModal.secondaryDescription,
                    ).toBe(
                        `After your trial, your plan will increase by $10/${Cadence.Month}.`,
                    )
                })

                it('should show price information for non-significant GMV impact', () => {
                    setupMocks(true) // Admin user
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.003, // Below threshold (< 0.005)
                        automationRate: {
                            value: 0.002,
                            prevValue: 0.001,
                            isLoading: false,
                        },
                        isLoading: false,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    // For Shopping Assistant with non-significant impact, it should show "Typical results achieved by merchants" format
                    expect(
                        result.current.trialEndedModal.secondaryDescription,
                    ).toBe(
                        `Typical results achieved by merchants. After upgrading, your plan will increase by $10/${Cadence.Month}.`,
                    )
                })
            })

            describe('when user is not admin', () => {
                it('should hide price information in secondaryDescription for significant GMV impact', () => {
                    setupMocks(false) // Non-admin user
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.04, // Above threshold
                        automationRate: {
                            value: 0.002,
                            prevValue: 0.001,
                            isLoading: false,
                        },
                        isLoading: false,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    expect(
                        result.current.trialEndedModal.secondaryDescription,
                    ).toBe('Typical results achieved by merchants.')
                })

                it('should hide price information for non-significant GMV impact', () => {
                    setupMocks(false) // Non-admin user
                    mockUseTrialMetrics.mockReturnValue({
                        gmvInfluenced: '$25',
                        gmvInfluencedRate: 0.003, // Below threshold (< 0.005)
                        automationRate: {
                            value: 0.002,
                            prevValue: 0.001,
                            isLoading: false,
                        },
                        isLoading: false,
                    })

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({}),
                    )

                    expect(
                        result.current.trialEndedModal.secondaryDescription,
                    ).toBe('Typical results achieved by merchants.')
                })
            })
        })
    })

    describe('useNewTrialUpgradePlanModal shoppingAssistantProps', () => {
        const mockStoreName = 'test-store'

        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trialType: TrialType.ShoppingAssistant,
                    isAdminUser: true,
                }),
            )
        })

        describe('when isOnboarded is true', () => {
            it('should return default modal props for onboarded users', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isAdminUser: true,
                        isOnboarded: true,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.title).toBe(
                    'Try out shopping assistant skills on your current plan',
                )
                expect(modal.subtitle).toBe(
                    "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%.",
                )
                expect(modal.primaryAction?.label).toBe('Start trial now')
                expect(modal.secondaryAction?.label).toBe('No, thanks')
                expect(modal.primaryAction?.onClick).toEqual(
                    expect.any(Function),
                )
                expect(modal.secondaryAction?.onClick).toEqual(
                    expect.any(Function),
                )
            })

            it('should call startTrial when primary action is clicked for onboarded users', async () => {
                const mockStartTrial = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isOnboarded: true,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    startTrial: mockStartTrial,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(),
                )

                expect(mockStartTrial).toHaveBeenCalledTimes(1)
                expect(mockStartTrial).toHaveBeenCalledWith(undefined)
            })

            it('should call onDismissTrialUpgradeModal when secondary action is clicked for onboarded users', async () => {
                const mockOnDismissTrialUpgradeModal = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isOnboarded: true,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    onDismissTrialUpgradeModal: mockOnDismissTrialUpgradeModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.secondaryAction?.onClick(),
                )

                expect(mockOnDismissTrialUpgradeModal).toHaveBeenCalledTimes(1)
            })
        })

        describe('when isOnboarded is false', () => {
            beforeEach(() => {
                mockUseFlag.mockReturnValue(true)
            })

            it('should return modified modal props for non-onboarded users', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isAdminUser: true,
                        isOnboarded: false,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.title).toBe(
                    'Try AI Agent with Shopping Assistant skills',
                )
                expect(modal.subtitle).toBe(
                    'Unlock powerful automation. Resolve 60% of support inquiries, proactively engage shoppers, and convert more visitors with 24/7 assistance using your own brand voice.',
                )
                expect(modal.primaryAction?.label).toBe(
                    'Start Trial now (AI Agent + Shopping Assistant)',
                )
                expect(modal.secondaryAction?.label).toBe('start AI Agent Only')
                expect(modal.primaryAction?.onClick).toEqual(
                    expect.any(Function),
                )
                expect(modal.secondaryAction?.onClick).toEqual(
                    expect.any(Function),
                )
            })

            it('should include SHOPPING_ASSISTANT_TRIAL_AI_AGENT_NOT_ONBOARDED features for non-onboarded users', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isAdminUser: true,
                        isOnboarded: false,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.features).toEqual([
                    {
                        icon: 'check',
                        title: 'Today',
                        description:
                            'Your 14-day trial has started. Automated interactions from shopping assistant capabilities count toward your current AI Agent usage, with no additional cost.',
                    },
                    {
                        icon: 'notifications_none',
                        title: 'Day 7',
                        description:
                            'We’ll remind you when you’re halfway through your trial.',
                    },
                    {
                        icon: 'star_outline',
                        title: 'Day 14',
                        description:
                            'Your AI Agent plan will automatically update to the new pricing which includes shopping assistant skills, unless you cancel before your trial ends.',
                    },
                ])
            })

            it('should call setShoppingAssistantTrialOptin and openTrialFinishSetupModal when primary action is clicked for non-onboarded users', async () => {
                const mockOpenTrialFinishSetupModal = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isOnboarded: false,
                    }),
                )

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    openTrialFinishSetupModal: mockOpenTrialFinishSetupModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(),
                )

                expect(mockOpenTrialFinishSetupModal).toHaveBeenCalledTimes(1)
            })

            it('should call setShoppingAssistantTrialOptin and startOnboardingWizzard when secondary action is clicked for non-onboarded users', async () => {
                const mockStartOnboardingWizzard = jest.fn()

                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isOnboarded: false,
                    }),
                )

                mockUseAiAgentTrialOnboarding.mockReturnValue({
                    startOnboardingWizard: mockStartOnboardingWizzard,
                })

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.secondaryAction?.onClick(),
                )

                expect(mockStartOnboardingWizzard).toHaveBeenCalledTimes(1)
            })

            it('should handle validation state correctly for non-onboarded users', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isAdminUser: true,
                        isOnboarded: false,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                // For non-onboarded users, validation should always be valid
                expect(modal.primaryAction?.isDisabled).toBe(false)
                expect(modal.primaryAction?.errorMessage).toBeUndefined()
            })

            describe('with feature flag enabled', () => {
                beforeEach(() => {
                    mockUseFlag.mockReturnValue(true)
                })

                it('should return modified modal props for non-onboarded users when feature flag is enabled', () => {
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            trialType: TrialType.ShoppingAssistant,
                            isAdminUser: true,
                            isOnboarded: false,
                        }),
                    )

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({ storeName: mockStoreName }),
                    )

                    const modal = result.current.newTrialUpgradePlanModal

                    expect(modal.title).toBe(
                        'Try AI Agent with Shopping Assistant skills',
                    )
                    expect(modal.subtitle).toBe(
                        'Unlock powerful automation. Resolve 60% of support inquiries, proactively engage shoppers, and convert more visitors with 24/7 assistance using your own brand voice.',
                    )
                    expect(modal.primaryAction?.label).toBe(
                        'Start Trial now (AI Agent + Shopping Assistant)',
                    )
                    expect(modal.secondaryAction?.label).toBe(
                        'start AI Agent Only',
                    )
                })
            })

            describe('with feature flag disabled', () => {
                beforeEach(() => {
                    mockUseFlag.mockReturnValue(false)
                })

                it('should return default modal props for non-onboarded users when feature flag is disabled', () => {
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            trialType: TrialType.ShoppingAssistant,
                            isAdminUser: true,
                            isOnboarded: false,
                        }),
                    )

                    const { result } = renderHookWithRouter(() =>
                        useTrialModalProps({ storeName: mockStoreName }),
                    )

                    const modal = result.current.newTrialUpgradePlanModal

                    expect(modal.title).toBe(
                        'Try out shopping assistant skills on your current plan',
                    )
                    expect(modal.subtitle).toBe(
                        "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%.",
                    )
                    expect(modal.primaryAction?.label).toBe('Start trial now')
                    expect(modal.secondaryAction?.label).toBe('No, thanks')
                })
            })
        })

        describe('when isOnboarded is undefined', () => {
            it('should return default modal props for undefined onboarded state', () => {
                mockUseTrialAccess.mockReturnValue(
                    createMockTrialAccess({
                        trialType: TrialType.ShoppingAssistant,
                        isAdminUser: true,
                        isOnboarded: undefined,
                    }),
                )

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({ storeName: mockStoreName }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.title).toBe(
                    'Try out shopping assistant skills on your current plan',
                )
                expect(modal.subtitle).toBe(
                    "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%.",
                )
                expect(modal.primaryAction?.label).toBe('Start trial now')
                expect(modal.secondaryAction?.label).toBe('No, thanks')
            })
        })

        describe('when source is OPPORTUNITIES', () => {
            it('should return opportunities-specific modal props', () => {
                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({
                        storeName: mockStoreName,
                        source: OPPORTUNITIES,
                    }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.title).toBe('Unlock AI Agent Opportunities')
                expect(modal.subtitle).toBe(
                    'Your AI Agent analyzes its own conversations to surface knowledge gaps and conflicts — so you can fix what matters most and improve automation quality over time. Plus, unlock Shopping Assistant skills to turn support into sales.',
                )
                expect(modal.primaryAction?.label).toBe(
                    'Start Trial now (Opportunities + Shopping Assistant)',
                )
                expect(modal.secondaryAction?.label).toBe('start AI Agent Only')
            })

            it('should include SHOPPING_ASSISTANT_TRIAL_WITH_OPPORTUNITIES features', () => {
                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({
                        storeName: mockStoreName,
                        source: OPPORTUNITIES,
                    }),
                )

                const modal = result.current.newTrialUpgradePlanModal

                expect(modal.features).toEqual([
                    {
                        icon: 'check',
                        title: 'Today',
                        description:
                            'Your 14-day trial has started. Get full access to Opportunities and Shopping Assistant skills at no additional cost during the trial.',
                    },
                    {
                        icon: 'notifications_none',
                        title: 'Day 7',
                        description:
                            'We\u2019ll remind you when you\u2019re halfway through your trial.',
                    },
                    {
                        icon: 'star_outline',
                        title: 'Day 14',
                        description:
                            'Your AI Agent plan will automatically update to the new pricing, unless you cancel before your trial ends.',
                    },
                ])
            })

            it('should call openTrialFinishSetupModal when primary action is clicked', async () => {
                const mockOpenTrialFinishSetupModal = jest.fn()

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    openTrialFinishSetupModal: mockOpenTrialFinishSetupModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({
                        storeName: mockStoreName,
                        source: OPPORTUNITIES,
                    }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.primaryAction?.onClick(),
                )

                expect(mockOpenTrialFinishSetupModal).toHaveBeenCalledTimes(1)
            })

            it('should call startOnboardingWizard and closeTrialUpgradeModal when secondary action is clicked', async () => {
                const mockStartOnboardingWizard = jest.fn()
                const mockCloseTrialUpgradeModal = jest.fn()

                mockUseAiAgentTrialOnboarding.mockReturnValue({
                    startOnboardingWizard: mockStartOnboardingWizard,
                })

                mockUseShoppingAssistantTrialFlow.mockReturnValue({
                    closeTrialUpgradeModal: mockCloseTrialUpgradeModal,
                } as unknown as UseShoppingAssistantTrialFlowReturn)

                const { result } = renderHookWithRouter(() =>
                    useTrialModalProps({
                        storeName: mockStoreName,
                        source: OPPORTUNITIES,
                    }),
                )

                await act(() =>
                    result.current.newTrialUpgradePlanModal?.secondaryAction?.onClick(),
                )

                expect(mockStartOnboardingWizard).toHaveBeenCalledTimes(1)
                expect(mockCloseTrialUpgradeModal).toHaveBeenCalledTimes(1)
            })
        })
    })
})
