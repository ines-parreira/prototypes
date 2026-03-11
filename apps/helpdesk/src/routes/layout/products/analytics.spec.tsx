import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    VOICE_PRODUCT_ID,
    voicePlan0,
} from 'fixtures/plans'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { STATS_ROUTES } from 'routes/constants'
import type { RootState } from 'state/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

import { useStatsNavbarConfig } from './analytics'

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const useTrialAccessMock = assumeMock(useTrialAccess)
useTrialAccessMock.mockReturnValue(createMockTrialAccess())

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)
useDashboardActionsMock.mockReturnValue({
    getDashboardsHandler: jest.fn().mockReturnValue([]),
} as any)

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const useCanUseAiSalesAgentMock = assumeMock(useCanUseAiSalesAgent)
useCanUseAiSalesAgentMock.mockReturnValue(false)

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
}

describe('useStatsNavbarConfig', () => {
    describe('sections structure', () => {
        it('should always return the core sections', () => {
            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const sectionIds = result.current.sections.map((s) => s.id)

            expect(sectionIds).toContain(StatsNavbarViewSections.Live)
            expect(sectionIds).toContain(StatsNavbarViewSections.Dashboards)
            expect(sectionIds).toContain(
                StatsNavbarViewSections.SupportPerformance,
            )
            expect(sectionIds).toContain(StatsNavbarViewSections.TicketInsights)
            expect(sectionIds).toContain(StatsNavbarViewSections.Automate)
            expect(sectionIds).toContain(StatsNavbarViewSections.Convert)
            expect(sectionIds).toContain(StatsNavbarViewSections.Voice)
        })

        it('should not include QualityManagement when NewSatisfactionReport flag is disabled', () => {
            useFlagMock.mockReturnValue(false)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const sectionIds = result.current.sections.map((s) => s.id)

            expect(sectionIds).not.toContain(
                StatsNavbarViewSections.QualityManagement,
            )
        })

        it('should include QualityManagement when NewSatisfactionReport flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.NewSatisfactionReport) return true
                return false
            })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const sectionIds = result.current.sections.map((s) => s.id)

            expect(sectionIds).toContain(
                StatsNavbarViewSections.QualityManagement,
            )
        })
    })

    describe('voice feature', () => {
        it('should mark voice items as requiresUpgrade when account lacks voice feature', () => {
            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const voiceSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Voice,
            )

            expect(
                voiceSection?.items?.every((item) => item.requiresUpgrade),
            ).toBe(true)
        })

        it('should not mark voice items as requiresUpgrade when account has voice feature', () => {
            const stateWithVoice: Partial<RootState> = {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [VOICE_PRODUCT_ID]: voicePlan0.plan_id,
                        },
                    },
                }),
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                stateWithVoice,
            )
            const voiceSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Voice,
            )

            expect(
                voiceSection?.items?.every((item) => !item.requiresUpgrade),
            ).toBe(true)
        })
    })

    describe('Auto QA placement', () => {
        describe('when NewSatisfactionReport flag is disabled', () => {
            beforeEach(() => {
                useFlagMock.mockReturnValue(false)
            })

            it('should include Auto QA under SupportPerformance', () => {
                const { result } = renderHookWithStoreAndQueryClientProvider(
                    () => useStatsNavbarConfig(),
                    defaultState,
                )
                const supportPerfSection = result.current.sections.find(
                    (s) => s.id === StatsNavbarViewSections.SupportPerformance,
                )
                const autoQAItem = supportPerfSection?.items?.find(
                    (item) => item.id === 'auto-qa',
                )

                expect(autoQAItem).toBeDefined()
                expect(autoQAItem?.route).toBe(
                    STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA,
                )
            })
        })

        describe('when NewSatisfactionReport flag is enabled', () => {
            beforeEach(() => {
                useFlagMock.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.NewSatisfactionReport)
                        return true
                    return false
                })
            })

            it('should not include Auto QA under SupportPerformance', () => {
                const { result } = renderHookWithStoreAndQueryClientProvider(
                    () => useStatsNavbarConfig(),
                    defaultState,
                )
                const supportPerfSection = result.current.sections.find(
                    (s) => s.id === StatsNavbarViewSections.SupportPerformance,
                )
                const autoQAItem = supportPerfSection?.items?.find(
                    (item) => item.id === 'auto-qa',
                )

                expect(autoQAItem).toBeUndefined()
            })

            it('should include Auto QA in QualityManagement when user is admin with AI agent access', () => {
                const stateWithAdminAndAutomation: Partial<RootState> = {
                    billing: fromJS(billingState),
                    currentUser: fromJS({
                        role: { name: UserRole.Admin },
                    }) as Map<any, any>,
                    currentAccount: fromJS({
                        current_subscription: {
                            products: {
                                [AUTOMATION_PRODUCT_ID]:
                                    basicMonthlyAutomationPlan.plan_id,
                            },
                        },
                    }),
                }

                const { result } = renderHookWithStoreAndQueryClientProvider(
                    () => useStatsNavbarConfig(),
                    stateWithAdminAndAutomation,
                )
                const qmSection = result.current.sections.find(
                    (s) => s.id === StatsNavbarViewSections.QualityManagement,
                )
                const autoQAItem = qmSection?.items?.find(
                    (item) => item.id === 'auto-qa',
                )

                expect(autoQAItem).toBeDefined()
                expect(autoQAItem?.route).toBe(
                    STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA,
                )
            })

            it('should not include Auto QA in QualityManagement when user is not an admin', () => {
                const { result } = renderHookWithStoreAndQueryClientProvider(
                    () => useStatsNavbarConfig(),
                    defaultState,
                )
                const qmSection = result.current.sections.find(
                    (s) => s.id === StatsNavbarViewSections.QualityManagement,
                )
                const autoQAItem = qmSection?.items?.find(
                    (item) => item.id === 'auto-qa',
                )

                expect(autoQAItem).toBeUndefined()
            })

            it('should not include Auto QA in QualityManagement when user lacks AI agent access', () => {
                const stateWithAdminNoAutomation: Partial<RootState> = {
                    ...defaultState,
                    currentUser: fromJS({
                        role: { name: UserRole.Admin },
                    }) as Map<any, any>,
                }

                const { result } = renderHookWithStoreAndQueryClientProvider(
                    () => useStatsNavbarConfig(),
                    stateWithAdminNoAutomation,
                )
                const qmSection = result.current.sections.find(
                    (s) => s.id === StatsNavbarViewSections.QualityManagement,
                )
                const autoQAItem = qmSection?.items?.find(
                    (item) => item.id === 'auto-qa',
                )

                expect(autoQAItem).toBeUndefined()
            })

            it('should always include Satisfaction in QualityManagement', () => {
                const { result } = renderHookWithStoreAndQueryClientProvider(
                    () => useStatsNavbarConfig(),
                    defaultState,
                )
                const qmSection = result.current.sections.find(
                    (s) => s.id === StatsNavbarViewSections.QualityManagement,
                )
                const satisfactionItem = qmSection?.items?.find(
                    (item) => item.id === 'quality-management-satisfaction',
                )

                expect(satisfactionItem).toBeDefined()
                expect(satisfactionItem?.route).toBe(
                    STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION,
                )
            })
        })
    })

    describe('Convert section', () => {
        it('should include a Campaigns item with the correct route', () => {
            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const convertSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Convert,
            )
            const campaignsItem = convertSection?.items?.find(
                (item) => item.id === 'convert-campaigns',
            )

            expect(campaignsItem).toBeDefined()
            expect(campaignsItem?.route).toBe(STATS_ROUTES.CONVERT_CAMPAIGNS)
            expect(campaignsItem?.label).toBe('Campaigns')
        })

        it('should mark Campaigns as requiresUpgrade when account is not a convert subscriber', () => {
            useFlagMock.mockReturnValue(false)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const convertSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Convert,
            )
            const campaignsItem = convertSection?.items?.find(
                (item) => item.id === 'convert-campaigns',
            )

            expect(campaignsItem?.requiresUpgrade).toBe(true)
        })

        it('should not mark Campaigns as requiresUpgrade when account is a convert subscriber', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.RevenueBetaTesters) return true
                return false
            })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const convertSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Convert,
            )
            const campaignsItem = convertSection?.items?.find(
                (item) => item.id === 'convert-campaigns',
            )

            expect(campaignsItem?.requiresUpgrade).toBe(false)
        })
    })

    describe('Automate section', () => {
        it('should include only the upgrade overview item when user has no AI agent access', () => {
            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )

            expect(automateSection?.items).toHaveLength(1)
            expect(automateSection?.items?.[0].id).toBe('automate-overview')
            expect(automateSection?.items?.[0].requiresUpgrade).toBe(true)
        })

        it('should include full items list when user has AI agent access', () => {
            const stateWithAutomation: Partial<RootState> = {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                stateWithAutomation,
            )
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const overviewItem = automateSection?.items?.find(
                (item) => item.id === 'automate-overview',
            )
            const performanceItem = automateSection?.items?.find(
                (item) => item.id === 'performance-by-features',
            )

            expect(overviewItem).toBeDefined()
            expect(overviewItem?.requiresUpgrade).toBeUndefined()
            expect(performanceItem).toBeDefined()
        })

        it('should include automate-ai-agent item when AIAgentStatsPage flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AIAgentStatsPage) return true
                return false
            })

            const stateWithAutomation: Partial<RootState> = {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                stateWithAutomation,
            )
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const aiAgentItem = automateSection?.items?.find(
                (item) => item.id === 'automate-ai-agent',
            )

            expect(aiAgentItem).toBeDefined()
            expect(aiAgentItem?.route).toBe(STATS_ROUTES.AUTOMATE_AI_AGENTS)
        })

        it('should include ai-sales-agent item when AiShoppingAssistantEnabled flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiShoppingAssistantEnabled)
                    return true
                return false
            })

            const stateWithAutomation: Partial<RootState> = {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                stateWithAutomation,
            )
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const aiSalesItem = automateSection?.items?.find(
                (item) => item.id === 'ai-sales-agent',
            )

            expect(aiSalesItem).toBeDefined()
            expect(aiSalesItem?.route).toBe(
                STATS_ROUTES.AI_SALES_AGENT_OVERVIEW,
            )
            expect(aiSalesItem?.requiresUpgrade).toBe(true)
        })

        it('should not mark ai-sales-agent as requiresUpgrade when user can use it', () => {
            useCanUseAiSalesAgentMock.mockReturnValue(true)
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiShoppingAssistantEnabled)
                    return true
                return false
            })

            const stateWithAutomation: Partial<RootState> = {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                stateWithAutomation,
            )
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const aiSalesItem = automateSection?.items?.find(
                (item) => item.id === 'ai-sales-agent',
            )

            expect(aiSalesItem?.requiresUpgrade).toBe(false)
        })

        it('should include trailingSlot on analytics items when AiAgentAnalyticsDashboardsNewScreens flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => {
                if (
                    flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                )
                    return true
                return false
            })

            const stateWithAutomation: Partial<RootState> = {
                billing: fromJS(billingState),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                basicMonthlyAutomationPlan.plan_id,
                        },
                    },
                }),
            }

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                stateWithAutomation,
            )
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const analyticsOverviewItem = automateSection?.items?.find(
                (item) => item.id === 'analytics-overview',
            )
            const analyticsAiAgentItem = automateSection?.items?.find(
                (item) => item.id === 'analytics-ai-agent',
            )

            expect(analyticsOverviewItem?.trailingSlot).toBeDefined()
            expect(analyticsAiAgentItem?.trailingSlot).toBeDefined()
        })
    })

    describe('Dashboards section', () => {
        it('should map getDashboardsHandler results to section items', () => {
            useDashboardActionsMock.mockReturnValue({
                getDashboardsHandler: jest.fn().mockReturnValue([
                    { id: 1, name: 'My Dashboard', emoji: null },
                    { id: 2, name: 'Team Stats', emoji: '📊' },
                ]),
            } as any)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const dashboardsSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Dashboards,
            )

            expect(dashboardsSection?.items).toHaveLength(2)
            expect(dashboardsSection?.items?.[0].id).toBe('dashboard-1')
            expect(dashboardsSection?.items?.[0].route).toBe(
                STATS_ROUTES.DASHBOARDS_PAGE.replace(':id', '1'),
            )
            expect(dashboardsSection?.items?.[0].label).toBe('My Dashboard')
        })

        it('should include emoji in label when dashboard has one', () => {
            useDashboardActionsMock.mockReturnValue({
                getDashboardsHandler: jest
                    .fn()
                    .mockReturnValue([
                        { id: 2, name: 'Team Stats', emoji: '📊' },
                    ]),
            } as any)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const dashboardsSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Dashboards,
            )

            expect(dashboardsSection?.items?.[0].label).toBe('📊 Team Stats')
        })

        it('should include actionsSlot', () => {
            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const dashboardsSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Dashboards,
            )

            expect(dashboardsSection?.actionsSlot).toBeDefined()
        })

        it('should return empty items when there are no dashboards', () => {
            useDashboardActionsMock.mockReturnValue({
                getDashboardsHandler: jest.fn().mockReturnValue([]),
            } as any)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStatsNavbarConfig(),
                defaultState,
            )
            const dashboardsSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Dashboards,
            )

            expect(dashboardsSection?.items).toHaveLength(0)
        })
    })
})
