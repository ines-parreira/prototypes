import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    VOICE_PRODUCT_ID,
    voicePlan0,
} from 'fixtures/plans'
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
                    (item) => item.key === 'auto-qa',
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
                    (item) => item.key === 'auto-qa',
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
                    (item) => item.key === 'auto-qa',
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
                    (item) => item.key === 'auto-qa',
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
                    (item) => item.key === 'auto-qa',
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
                    (item) => item.key === 'quality-management-satisfaction',
                )

                expect(satisfactionItem).toBeDefined()
                expect(satisfactionItem?.route).toBe(
                    STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION,
                )
            })
        })
    })
})
