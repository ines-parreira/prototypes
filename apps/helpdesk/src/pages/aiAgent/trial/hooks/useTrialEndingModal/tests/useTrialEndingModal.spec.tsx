import * as React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Route, Router } from 'react-router-dom'

import { earlyAccessMonthlyAutomationPlan } from 'fixtures/productPrices'
import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialEndingModal } from 'pages/aiAgent/trial/hooks/useTrialEndingModal/useTrialEndingModal'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { trial } from 'pages/settings/new_billing/fixtures'

jest.mock('models/billing/queries')
jest.mock('pages/aiAgent/trial/hooks/useTrialMetrics')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('hooks/useAppSelector')
jest.mock('hooks/aiAgent/useAiAgentUpgradePlan')

const mockUseBillingState = assumeMock(useBillingState)
const mockUseAiAgentUpgradePlan = assumeMock(useAiAgentUpgradePlan)
const mockUseTrialMetrics = assumeMock(useTrialMetrics)
const mockUseTrialEnding = assumeMock(useTrialEnding)
const mockUseAppSelector = assumeMock(useAppSelector)

describe('useTrialEndingModal', () => {
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

        mockUseTrialMetrics.mockReturnValue({
            gmvInfluenced: '$25',
            gmvInfluencedRate: 0.05,
            isLoading: false,
        })

        mockUseTrialEnding.mockReturnValue({
            remainingDays: 14,
            remainingDaysFloat: 14.0,
            isTrialExtended: false,
            trialEndDatetime: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            trialTerminationDatetime: null,
            optedOutDatetime: null,
        })

        mockUseAppSelector.mockImplementation((selector) => {
            if (selector && selector.name === 'memoized') {
                return []
            }
            return fromJS({
                domain: 'test-domain.com',
                role: {
                    name: 'admin',
                },
            })
        })
    })

    describe('when trialType is ShoppingAssistant', () => {
        it('should return correct trial ending modal props', () => {
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

            const trialAccess = createMockTrialAccess({
                trialType: TrialType.ShoppingAssistant,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            }

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.ShoppingAssistant,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual(
                'Shopping Assistant trial ends tomorrow',
            )
            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container
            expect(descriptionElement.textContent).toEqual(
                "Shopping Assistant drove $25 uplift in GMV. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
            )
            expect(result.current.secondaryDescription).toEqual(
                `With the upgrade, your plan will increase by $10/${Cadence.Month}.`,
            )
            expect(result.current.advantages).toEqual(['$25 GMV uplift'])
        })

        it('should handle missing early access automate plan', () => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: null,
            } as any)

            const trialAccess = createMockTrialAccess({
                trialType: TrialType.ShoppingAssistant,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            }

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.ShoppingAssistant,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual(
                'Shopping Assistant trial ends tomorrow',
            )
            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container
            expect(descriptionElement.textContent).toEqual(
                "Shopping Assistant drove $25 uplift in GMV. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
            )
            expect(result.current.secondaryDescription).toEqual(
                'With the upgrade, the price of your plan remains the same.',
            )
            expect(result.current.advantages).toEqual(['$25 GMV uplift'])
        })
    })

    describe('when trialType is AiAgent', () => {
        beforeEach(() => {
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
            const trialAccess = createMockTrialAccess({
                trialType: TrialType.AiAgent,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.03,
                automationRate: {
                    value: 0.65,
                    prevValue: 0.5,
                    isLoading: false,
                },
                isLoading: false,
            }

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.AiAgent,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual('AI Agent trial ends tomorrow')
            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container
            expect(descriptionElement.textContent).toContain(
                'AI Agent handled 65% of customer inquiries',
            )
            expect(descriptionElement.textContent).toContain(
                'drove a 3% lift in revenue',
            )
            expect(descriptionElement.textContent).toContain(
                'To keep the momentum going, your plan will be upgraded automatically tomorrow.',
            )
            expect(result.current.advantages).toEqual(['65% automation rate'])
            expect(result.current.secondaryDescription).toEqual(
                `With the upgrade, your plan will increase by $10/${Cadence.Month}.`,
            )
        })

        it('should return beginning title and generic description when automation rate is not significant', () => {
            const trialAccess = createMockTrialAccess({
                trialType: TrialType.AiAgent,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.03,
                automationRate: {
                    value: 0.002,
                    prevValue: 0.001,
                    isLoading: false,
                },
                isLoading: false,
            }

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.AiAgent,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual('AI Agent trial ends tomorrow')
            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container
            expect(descriptionElement.textContent).toContain(
                'AI Agent has been working behind the scenes to help your team',
            )
            expect(result.current.advantages).toEqual([
                '60% support inquiries',
                '35% faster ticket handling',
                '62% conversion rate',
            ])
            expect(result.current.secondaryDescription).toEqual(
                `Typical results achieved by merchants. After upgrading, your plan will increase by $10/${Cadence.Month}.`,
            )
        })

        it('should handle undefined automation rate', () => {
            const trialAccess = createMockTrialAccess({
                trialType: TrialType.AiAgent,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.03,
                automationRate: undefined,
                isLoading: false,
            }

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.AiAgent,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual('AI Agent trial ends tomorrow')
            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container
            expect(descriptionElement.textContent).toContain(
                'AI Agent has been working behind the scenes to help your team',
            )
            expect(result.current.advantages).toEqual([
                '60% support inquiries',
                '35% faster ticket handling',
                '62% conversion rate',
            ])
        })

        it('should handle automation rate exactly at threshold', () => {
            const trialAccess = createMockTrialAccess({
                trialType: TrialType.AiAgent,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.03,
                automationRate: {
                    value: 0.005,
                    prevValue: 0.003,
                    isLoading: false,
                },
                isLoading: false,
            }

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.AiAgent,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual('AI Agent trial ends tomorrow')
            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container
            expect(descriptionElement.textContent).toContain(
                'AI Agent has been working behind the scenes to help your team',
            )
        })

        it('should handle automation rate just above threshold', () => {
            const trialAccess = createMockTrialAccess({
                trialType: TrialType.AiAgent,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.03,
                automationRate: {
                    value: 0.006,
                    prevValue: 0.003,
                    isLoading: false,
                },
                isLoading: false,
            }

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.AiAgent,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual('AI Agent trial ends tomorrow')
            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container
            expect(descriptionElement.textContent).toContain(
                'AI Agent handled 0.6% of customer inquiries',
            )
            expect(descriptionElement.textContent).toContain(
                'drove a 3% lift in revenue',
            )
            expect(descriptionElement.textContent).toContain(
                'To keep the momentum going, your plan will be upgraded automatically tomorrow.',
            )
        })

        it('should include multi-store message when there are multiple stores', () => {
            const trialAccess = createMockTrialAccess({
                trialType: TrialType.AiAgent,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.03,
                automationRate: {
                    value: 0.002,
                    prevValue: 0.001,
                    isLoading: false,
                },
                isLoading: false,
            }

            mockUseAppSelector.mockReset()

            const accountState = fromJS({
                domain: 'test-domain.com',
                role: {
                    name: 'admin',
                },
            })
            const shopifyIntegrations = [{ id: 1 }, { id: 2 }]

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector && selector.name === 'memoized') {
                    return shopifyIntegrations
                }
                return accountState
            })

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.AiAgent,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual('AI Agent trial ends tomorrow')

            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container

            expect(descriptionElement.textContent).toEqual(
                'AI Agent has been working behind the scenes to help your team deliver faster, more efficient support and sales. To keep the momentum going, your plan will be upgraded automatically tomorrow – giving you continued access to AI Agent across all your stores.',
            )
        })

        it('should not include multi-store message when there is only one store', () => {
            const trialAccess = createMockTrialAccess({
                trialType: TrialType.AiAgent,
                isAdminUser: true,
            })
            const trialMetrics = {
                gmvInfluenced: '$25',
                gmvInfluencedRate: 0.03,
                automationRate: {
                    value: 0.002,
                    prevValue: 0.001,
                    isLoading: false,
                },
                isLoading: false,
            }

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector && selector.name === 'memoized') {
                    return [{}]
                }
                return fromJS({
                    domain: 'test-domain.com',
                    role: {
                        name: 'admin',
                    },
                })
            })

            const { result } = renderHookWithRouter(() =>
                useTrialEndingModal({
                    trialType: TrialType.AiAgent,
                    trialMetrics,
                    trialAccess,
                }),
            )

            expect(result.current.title).toEqual('AI Agent trial ends tomorrow')

            const descriptionElement = render(
                <>{result.current.description}</>,
            ).container

            expect(descriptionElement.textContent).toEqual(
                'AI Agent has been working behind the scenes to help your team deliver faster, more efficient support and sales. To keep the momentum going, your plan will be upgraded automatically tomorrow.',
            )
        })
    })

    describe('useTrialEndingModal description', () => {
        const HIGH_GMV_RATE = 0.06
        const GMV_INFLUENCED = '$250'

        beforeEach(() => {
            mockUseBillingState.mockReturnValue({
                data: trial,
            } as any)
            mockUseAiAgentUpgradePlan.mockReturnValue({
                data: earlyAccessMonthlyAutomationPlan,
            } as any)
        })

        describe('when gmvInfluencedRate > 0.005', () => {
            it('should return personalized message with GMV amount', () => {
                const trialAccess = createMockTrialAccess({
                    trialType: TrialType.ShoppingAssistant,
                })
                const trialMetrics = {
                    gmvInfluenced: GMV_INFLUENCED,
                    gmvInfluencedRate: HIGH_GMV_RATE,
                    isLoading: false,
                }

                const { result } = renderHookWithRouter(() =>
                    useTrialEndingModal({
                        trialType: TrialType.ShoppingAssistant,
                        trialMetrics,
                        trialAccess,
                    }),
                )

                const description = result.current.description as any
                expect(description?.type).toBe('span')
                const children = description?.props?.children
                expect(children?.[0]).toBe('Shopping Assistant drove ')
                expect(children?.[1]?.type).toBe('strong')
                expect(children?.[1]?.props?.children).toBe('$250')
                expect(children?.[3]).toContain('uplift in GMV')
            })

            it('should handle different GMV amounts in personalized message', () => {
                const trialAccess = createMockTrialAccess({
                    trialType: TrialType.ShoppingAssistant,
                })
                const trialMetrics = {
                    gmvInfluenced: '$1,500',
                    gmvInfluencedRate: 0.08,
                    isLoading: false,
                }

                const { result } = renderHookWithRouter(() =>
                    useTrialEndingModal({
                        trialType: TrialType.ShoppingAssistant,
                        trialMetrics,
                        trialAccess,
                    }),
                )

                const description = result.current.description as any
                expect(description?.type).toBe('span')
                const children = description?.props?.children
                expect(children?.[0]).toBe('Shopping Assistant drove ')
                expect(children?.[1]?.type).toBe('strong')
                expect(children?.[1]?.props?.children).toBe('$1,500')
                expect(children?.[3]).toContain('uplift in GMV')
            })
        })

        describe('when gmvInfluencedRate <= 0.005', () => {
            it('should return generic message for rates slightly below threshold', () => {
                const trialAccess = createMockTrialAccess({
                    trialType: TrialType.ShoppingAssistant,
                })
                const trialMetrics = {
                    gmvInfluenced: GMV_INFLUENCED,
                    gmvInfluencedRate: 0.003,
                    isLoading: false,
                }

                const { result } = renderHookWithRouter(() =>
                    useTrialEndingModal({
                        trialType: TrialType.ShoppingAssistant,
                        trialMetrics,
                        trialAccess,
                    }),
                )
                const description = result.current.description as any
                expect(description?.type).toBe('span')
                const children = description?.props?.children
                expect(children).toBe(
                    "Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
                )
            })
        })
    })
})
