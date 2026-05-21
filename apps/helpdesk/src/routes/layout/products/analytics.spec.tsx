import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
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
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { STATS_ROUTES } from 'routes/constants'
import type { RootState } from 'state/types'

import { useStatsNavbarConfig } from './analytics'

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const useTrialAccessMock = assumeMock(useTrialAccess)
useTrialAccessMock.mockReturnValue(createMockTrialAccess())

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlagWithLoading)

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)
useDashboardActionsMock.mockReturnValue({
    getDashboardsHandler: jest.fn().mockReturnValue([]),
} as any)

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const useCanUseAiSalesAgentMock = assumeMock(useCanUseAiSalesAgent)
useCanUseAiSalesAgentMock.mockReturnValue(false)

jest.mock('pages/common/hooks/useIsConvertSubscriber')
const useIsConvertSubscriberMock = assumeMock(useIsConvertSubscriber)
useIsConvertSubscriberMock.mockReturnValue(false)

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
}

describe('useStatsNavbarConfig', () => {
    describe('sections structure', () => {
        it('should always return the core sections', () => {
            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
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
            useFlagMock.mockReturnValue({ value: false, isLoading: false })

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const sectionIds = result.current.sections.map((s) => s.id)

            expect(sectionIds).not.toContain(
                StatsNavbarViewSections.QualityManagement,
            )
        })

        it('should include QualityManagement when NewSatisfactionReport flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value: flag === FeatureFlagKey.NewSatisfactionReport,
                isLoading: false,
            }))

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const sectionIds = result.current.sections.map((s) => s.id)

            expect(sectionIds).toContain(
                StatsNavbarViewSections.QualityManagement,
            )
        })
    })

    describe('Satisfaction item in SupportPerformance', () => {
        it('should include satisfaction when NewSatisfactionReport flag is disabled', () => {
            useFlagMock.mockReturnValue({ value: false, isLoading: false })

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const supportPerfSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.SupportPerformance,
            )
            const satisfactionItem = supportPerfSection?.items?.find(
                (item) => item.id === 'support-performance-satisfaction',
            )

            expect(satisfactionItem).toBeDefined()
            expect(satisfactionItem?.route).toBe(
                STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION,
            )
        })

        it('should not include satisfaction when NewSatisfactionReport flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value: flag === FeatureFlagKey.NewSatisfactionReport,
                isLoading: false,
            }))

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const supportPerfSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.SupportPerformance,
            )
            const satisfactionItem = supportPerfSection?.items?.find(
                (item) => item.id === 'support-performance-satisfaction',
            )

            expect(satisfactionItem).toBeUndefined()
        })
    })

    describe('Help Center item in SupportPerformance', () => {
        it('should include help-center when HelpCenterAnalytics flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value: flag === FeatureFlagKey.HelpCenterAnalytics,
                isLoading: false,
            }))

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const supportPerfSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.SupportPerformance,
            )
            const helpCenterItem = supportPerfSection?.items?.find(
                (item) => item.id === 'support-performance-help-center',
            )

            expect(helpCenterItem).toBeDefined()
            expect(helpCenterItem?.route).toBe(
                STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER,
            )
        })

        it('should not include help-center when HelpCenterAnalytics flag is disabled', () => {
            useFlagMock.mockReturnValue({ value: false, isLoading: false })

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const supportPerfSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.SupportPerformance,
            )
            const helpCenterItem = supportPerfSection?.items?.find(
                (item) => item.id === 'support-performance-help-center',
            )

            expect(helpCenterItem).toBeUndefined()
        })
    })

    describe('voice feature', () => {
        it('should mark voice items as requiresUpgrade when account lacks voice feature', () => {
            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithVoice,
            })
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
                useFlagMock.mockReturnValue({ value: false, isLoading: false })
            })

            it('should include Auto QA under SupportPerformance when user is admin with AI agent access', () => {
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

                const { result } = renderHook(() => useStatsNavbarConfig(), {
                    storeState: stateWithAdminAndAutomation,
                })
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

            it('should not include Auto QA under SupportPerformance when user lacks access', () => {
                const { result } = renderHook(() => useStatsNavbarConfig(), {
                    storeState: defaultState,
                })
                const supportPerfSection = result.current.sections.find(
                    (s) => s.id === StatsNavbarViewSections.SupportPerformance,
                )
                const autoQAItem = supportPerfSection?.items?.find(
                    (item) => item.id === 'auto-qa',
                )

                expect(autoQAItem).toBeUndefined()
            })
        })

        describe('when NewSatisfactionReport flag is enabled', () => {
            beforeEach(() => {
                useFlagMock.mockImplementation((flag) => ({
                    value: flag === FeatureFlagKey.NewSatisfactionReport,
                    isLoading: false,
                }))
            })

            it('should not include Auto QA under SupportPerformance', () => {
                const { result } = renderHook(() => useStatsNavbarConfig(), {
                    storeState: defaultState,
                })
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

                const { result } = renderHook(() => useStatsNavbarConfig(), {
                    storeState: stateWithAdminAndAutomation,
                })
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
                const { result } = renderHook(() => useStatsNavbarConfig(), {
                    storeState: defaultState,
                })
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

                const { result } = renderHook(() => useStatsNavbarConfig(), {
                    storeState: stateWithAdminNoAutomation,
                })
                const qmSection = result.current.sections.find(
                    (s) => s.id === StatsNavbarViewSections.QualityManagement,
                )
                const autoQAItem = qmSection?.items?.find(
                    (item) => item.id === 'auto-qa',
                )

                expect(autoQAItem).toBeUndefined()
            })

            it('should always include Satisfaction in QualityManagement', () => {
                const { result } = renderHook(() => useStatsNavbarConfig(), {
                    storeState: defaultState,
                })
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

    describe('Revamp overall performance new screens', () => {
        it('should include performance-overview and performance-channels items with a trailingSlot when RevampOverallPerformanceNewScreens flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value:
                    flag === FeatureFlagKey.RevampOverallPerformanceNewScreens,
                isLoading: false,
            }))

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const supportPerfSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.SupportPerformance,
            )
            const performanceOverviewItem = supportPerfSection?.items?.find(
                (item) => item.id === 'performance-overview',
            )
            const performanceChannelsItem = supportPerfSection?.items?.find(
                (item) => item.id === 'performance-channels',
            )

            expect(performanceOverviewItem).toBeDefined()
            expect(performanceOverviewItem?.route).toBe(
                STATS_ROUTES.PERFORMANCE_OVERVIEW,
            )
            expect(performanceOverviewItem?.label).toBe('Overview')
            expect(performanceOverviewItem?.trailingSlot).toBeDefined()

            expect(performanceChannelsItem).toBeDefined()
            expect(performanceChannelsItem?.route).toBe(
                STATS_ROUTES.PERFORMANCE_CHANNELS,
            )
            expect(performanceChannelsItem?.label).toBe('Channels')
            expect(performanceChannelsItem?.trailingSlot).toBeDefined()
        })

        it('should not include performance-overview or performance-channels items when RevampOverallPerformanceNewScreens flag is disabled', () => {
            useFlagMock.mockReturnValue({ value: false, isLoading: false })

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const supportPerfSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.SupportPerformance,
            )

            expect(
                supportPerfSection?.items?.find(
                    (item) => item.id === 'performance-overview',
                ),
            ).toBeUndefined()
            expect(
                supportPerfSection?.items?.find(
                    (item) => item.id === 'performance-channels',
                ),
            ).toBeUndefined()
        })
    })

    describe('Convert section', () => {
        it('should include a Campaigns item with the correct route', () => {
            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
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
            useFlagMock.mockReturnValue({ value: false, isLoading: false })

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const convertSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Convert,
            )
            const campaignsItem = convertSection?.items?.find(
                (item) => item.id === 'convert-campaigns',
            )

            expect(campaignsItem?.requiresUpgrade).toBe(true)
        })

        it('should not mark Campaigns as requiresUpgrade when account is a convert subscriber', () => {
            useIsConvertSubscriberMock.mockReturnValue(true)

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
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
            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
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
            useFlagMock.mockImplementation((flag) => ({
                value: flag === FeatureFlagKey.AIAgentStatsPage,
                isLoading: false,
            }))

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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const aiAgentItem = automateSection?.items?.find(
                (item) => item.id === 'automate-ai-agent',
            )

            expect(aiAgentItem).toBeDefined()
            expect(aiAgentItem?.route).toBe(STATS_ROUTES.AUTOMATE_AI_AGENTS)
        })

        it('should include ai-sales-agent item', () => {
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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const aiSalesItem = automateSection?.items?.find(
                (item) => item.id === 'ai-sales-agent',
            )

            expect(aiSalesItem?.requiresUpgrade).toBe(false)
        })

        it('should set tooltipProps on analytics-overview when AiAgentAnalyticsDashboardsNewScreens and AiAgentAnalyticsNavTooltip flags are enabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value:
                    flag ===
                        FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens ||
                    flag === FeatureFlagKey.AiAgentAnalyticsNavTooltip,
                isLoading: false,
            }))

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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const analyticsOverviewItem = automateSection?.items?.find(
                (item) => item.id === 'analytics-overview',
            )

            expect(analyticsOverviewItem?.tooltipProps).toBeDefined()
            expect(analyticsOverviewItem?.tooltipProps?.videoSrc).toBeDefined()
            expect(
                analyticsOverviewItem?.tooltipProps?.videoPoster,
            ).toBeDefined()
            expect(analyticsOverviewItem?.tooltipProps?.title).toBeDefined()
            expect(analyticsOverviewItem?.tooltipProps?.body).toBeDefined()
            expect(
                analyticsOverviewItem?.tooltipProps?.learnMoreUrl,
            ).toBeDefined()
        })

        it('should set tooltipProps on the Automate section when AiAgentAnalyticsNavTooltip flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value: flag === FeatureFlagKey.AiAgentAnalyticsNavTooltip,
                isLoading: false,
            }))

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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )

            expect(automateSection?.tooltipProps).toBeDefined()
            expect(automateSection?.tooltipProps?.title).toBe('AI & Automation')
            expect(automateSection?.tooltipProps?.videoSrc).toBeDefined()
            expect(automateSection?.tooltipProps?.videoPoster).toBeDefined()
            expect(automateSection?.tooltipProps?.body).toBeDefined()
            expect(automateSection?.tooltipProps?.learnMoreUrl).toBeDefined()
        })

        it('should not set tooltipProps on the Automate section when AiAgentAnalyticsNavTooltip flag is disabled', () => {
            useFlagMock.mockReturnValue({ value: false, isLoading: false })

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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )

            expect(automateSection?.tooltipProps).toBeUndefined()
        })

        it('should not set tooltipProps on analytics-overview when AiAgentAnalyticsNavTooltip flag is disabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value:
                    flag ===
                    FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens,
                isLoading: false,
            }))

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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )
            const analyticsOverviewItem = automateSection?.items?.find(
                (item) => item.id === 'analytics-overview',
            )

            expect(analyticsOverviewItem?.tooltipProps).toBeUndefined()
        })

        it('should include trailingSlot on analytics items when AiAgentAnalyticsDashboardsNewScreens flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value:
                    flag ===
                    FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens,
                isLoading: false,
            }))

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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
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

            const legacyOverviewItem = automateSection?.items?.find(
                (item) => item.id === 'automate-overview',
            )
            expect(legacyOverviewItem).toBeDefined()
        })

        it('should hide legacy items and show New tag when both AiAgentAnalyticsDashboardsNewScreens and AiAgentAnalyticsDisableLegacyReports flags are enabled', () => {
            useFlagMock.mockImplementation((flag) => ({
                value:
                    flag ===
                        FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens ||
                    flag ===
                        FeatureFlagKey.AiAgentAnalyticsDisableLegacyReports,
                isLoading: false,
            }))

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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: stateWithAutomation,
            })
            const automateSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Automate,
            )

            expect(
                automateSection?.items?.find(
                    (item) => item.id === 'analytics-overview',
                )?.trailingSlot,
            ).toBeDefined()
            expect(
                automateSection?.items?.find(
                    (item) => item.id === 'analytics-ai-agent',
                )?.trailingSlot,
            ).toBeDefined()

            expect(
                automateSection?.items?.find(
                    (item) => item.id === 'automate-overview',
                ),
            ).toBeUndefined()
            expect(
                automateSection?.items?.find(
                    (item) => item.id === 'automate-ai-agent',
                ),
            ).toBeUndefined()
            expect(
                automateSection?.items?.find(
                    (item) => item.id === 'ai-sales-agent',
                ),
            ).toBeUndefined()
            expect(
                automateSection?.items?.find(
                    (item) => item.id === 'performance-by-features',
                ),
            ).toBeUndefined()
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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
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

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const dashboardsSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Dashboards,
            )

            expect(dashboardsSection?.items?.[0].label).toBe('📊 Team Stats')
        })

        it('should include actionsSlot', () => {
            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const dashboardsSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Dashboards,
            )

            expect(dashboardsSection?.actionsSlot).toBeDefined()
        })

        it('should return empty items when there are no dashboards', () => {
            useDashboardActionsMock.mockReturnValue({
                getDashboardsHandler: jest.fn().mockReturnValue([]),
            } as any)

            const { result } = renderHook(() => useStatsNavbarConfig(), {
                storeState: defaultState,
            })
            const dashboardsSection = result.current.sections.find(
                (s) => s.id === StatsNavbarViewSections.Dashboards,
            )

            expect(dashboardsSection?.items).toHaveLength(0)
        })
    })
})
