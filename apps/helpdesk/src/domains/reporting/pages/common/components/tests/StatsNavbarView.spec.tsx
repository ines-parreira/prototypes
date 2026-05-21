import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { StatsNavbarView } from 'domains/reporting/pages/common/components/StatsNavbarView/StatsNavbarView'
import { getDashboardPath } from 'domains/reporting/pages/dashboards/utils'
import { SLA_PAGE_TITLE } from 'domains/reporting/pages/sla/constants'
import { AUTO_QA_PAGE_TITLE } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/plans'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { IntegrationType } from 'models/integration/constants'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import { STATS_ROUTES } from 'routes/constants'
import type { RootState } from 'state/types'

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const useTrialAccessMock = assumeMock(useTrialAccess)
useTrialAccessMock.mockReturnValue(createMockTrialAccess())
jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(),
}))
const useStandaloneAiContextMock = assumeMock(useStandaloneAiContext)
jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)
jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})
jest.mock('domains/reporting/hooks/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)
function getIntegration(id: number, type: IntegrationType) {
    return {
        id,
        type,
        name: `My Phone Integration ${id}`,
        meta: {
            emoji: '',
            phone_number_id: id,
        },
    }
}
describe('StatsNavbarViewV2', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
        integrations: fromJS({
            integrations: [
                getIntegration(1, IntegrationType.Shopify),
                getIntegration(2, IntegrationType.Magento2),
            ],
        }),
    }
    const mockData = [
        { id: '1', name: 'Report 1', emoji: '📊' },
        { id: '2', name: 'Report 2', emoji: 'plus' },
    ]
    beforeEach(() => {
        useDashboardActionsMock.mockReturnValue({
            getDashboardsHandler: () => mockData,
        } as any)
        useStandaloneAiContextMock.mockReturnValue(
            createMockStandaloneAiAccess({
                statistics: { canRead: true, canWrite: true },
            }),
        )
    })
    it('should render the link to new busiest times of days', () => {
        render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        expect(screen.getByText('Busiest Times')).toBeInTheDocument()
    })
    describe('New Agents Performance', () => {
        it('should render the link to new agents page when having flag enabled', () => {
            render(<StatsNavbarView />, {
                storeState: defaultState,
            })
            const agentsPerformanceLink = screen
                .getAllByRole('link', { name: new RegExp('Agents') })
                .find(
                    (el) =>
                        el.getAttribute('href') ===
                        `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`,
                )
            expect(agentsPerformanceLink).toBeInTheDocument()
        })
    })
    it('should render the link to the Convert Campaigns', () => {
        render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        expect(screen.getByText('Campaigns')).toBeInTheDocument()
    })
    it('should render the link to the Help Center Stats when having access to the feature', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.HelpCenterAnalytics) return true
            return false
        })
        render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        expect(screen.getByText('Help Center')).toBeInTheDocument()
    })
    it('should render the link to the Voice Overview', () => {
        render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        expect(screen.getAllByText('Voice')).toHaveLength(2)
        expect(screen.getAllByText('Agents')).toHaveLength(3)
    })
    it('should render the link to the Service Level Agreements', () => {
        render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        expect(screen.getByText(SLA_PAGE_TITLE)).toBeInTheDocument()
    })
    it.each([UserRole.Admin, UserRole.Agent])(
        'should render the link to the Auto QA',
        (role) => {
            const state = {
                ...defaultState,
                currentUser: fromJS({
                    role: { name: role },
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
            render(<StatsNavbarView />, {
                storeState: state,
            })
            expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        },
    )
    it('should render the link to the New Tags Report page', () => {
        const { container } = render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        const TagsReportLink = container.querySelector(
            'a[href="/app/stats/tags"]',
        )
        expect(TagsReportLink).toBeInTheDocument()
    })
    it('should render the link to the New Channels Reports', () => {
        const { container } = render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        const newChannelsReportLink = container.querySelector(
            'a[href="/app/stats/channels"]',
        )
        expect(newChannelsReportLink).toBeInTheDocument()
    })
    it('should render the link to the New Satisfaction Report', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.NewSatisfactionReport) return true
            return false
        })
        const { container } = render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        const newSatisfactionReportLink = container.querySelector(
            'a[href="/app/stats/quality-management-satisfaction"]',
        )
        expect(newSatisfactionReportLink).toBeInTheDocument()
        expect(screen.getByText('Satisfaction')).toBeInTheDocument()
    })
    it('should render only the New Satisfaction Report when new-satisfaction-report is enabled', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.NewSatisfactionReport) return true
            return false
        })
        const { getAllByText } = render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        const satisfactionReportLinks = getAllByText('Satisfaction')
        expect(satisfactionReportLinks.length).toBe(1)
    })
    it('should render the link to the Live Voice', () => {
        const { container } = render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        const liveVoiceLink = container.querySelector(
            'a[href="/app/stats/live-voice"]',
        )
        expect(liveVoiceLink).toBeInTheDocument()
    })
    it('should render the link to the Dashboards', () => {
        const { container } = render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        const FirstDashboardLink = container.querySelector(
            `a[href="${getDashboardPath(1)}"]`,
        )
        const SecondDashboardLink = container.querySelector(
            `a[href="${getDashboardPath(2)}"]`,
        )
        expect(FirstDashboardLink).toBeInTheDocument()
        expect(SecondDashboardLink).toBeInTheDocument()
    })
    it('should render the Auto QA link exclusively within Quality Management section when NewSatisfactionReport feature flag is enabled', () => {
        const state = {
            ...defaultState,
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
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.NewSatisfactionReport) return true
            return false
        })
        const { container } = render(<StatsNavbarView />, {
            storeState: state,
        })
        const qualityManagementNavBarBlock = container.querySelector(
            '[data-candu-id="navbar-block-quality-management"]',
        )?.parentElement?.parentElement
        const autoQANavbarLinks = screen
            .getAllByRole('link', { name: new RegExp('Auto QA') })
            .filter((el) => el.getAttribute('href') === '/app/stats/auto-qa')
        expect(qualityManagementNavBarBlock).toBeInTheDocument()
        const autoQATextInclusion =
            qualityManagementNavBarBlock?.textContent?.includes('Auto QA')
        expect(autoQATextInclusion).toBe(true)
        expect(autoQANavbarLinks.length).toBe(1)
    })
    describe('Revamp overall performance new screens', () => {
        it('should render the new performance overview and channels links when RevampOverallPerformanceNewScreens flag is enabled', () => {
            useFlagMock.mockImplementation(
                (flag) =>
                    flag === FeatureFlagKey.RevampOverallPerformanceNewScreens,
            )

            const { container } = render(<StatsNavbarView />, {
                storeState: defaultState,
            })

            expect(
                container.querySelector(
                    `a[href="${STATS_ROUTE_PREFIX}${STATS_ROUTES.PERFORMANCE_OVERVIEW}"]`,
                ),
            ).toBeInTheDocument()
            expect(
                container.querySelector(
                    `a[href="${STATS_ROUTE_PREFIX}${STATS_ROUTES.PERFORMANCE_CHANNELS}"]`,
                ),
            ).toBeInTheDocument()
            expect(screen.getAllByText('Beta').length).toBeGreaterThanOrEqual(2)
        })

        it('should not render the new performance overview and channels links when RevampOverallPerformanceNewScreens flag is disabled', () => {
            useFlagMock.mockReturnValue(false)

            const { container } = render(<StatsNavbarView />, {
                storeState: defaultState,
            })

            expect(
                container.querySelector(
                    `a[href="${STATS_ROUTE_PREFIX}${STATS_ROUTES.PERFORMANCE_OVERVIEW}"]`,
                ),
            ).not.toBeInTheDocument()
            expect(
                container.querySelector(
                    `a[href="${STATS_ROUTE_PREFIX}${STATS_ROUTES.PERFORMANCE_CHANNELS}"]`,
                ),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Beta')).not.toBeInTheDocument()
        })
    })
    it('should render only AutomateStatsNavbar when standalone AI agent', () => {
        useStandaloneAiContextMock.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
                statistics: { canRead: true, canWrite: true },
            }),
        )
        render(<StatsNavbarView />, {
            storeState: defaultState,
        })
        expect(
            screen.getByRole('button', { name: /AI Agent/i }),
        ).toBeInTheDocument()
        expect(screen.queryByText('Busiest Times')).not.toBeInTheDocument()
    })
    it('should render the Auto QA link exclusively within Support Performance section when NewSatisfactionReport feature flag is disabled', () => {
        const state = {
            ...defaultState,
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
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.NewSatisfactionReport) return false
            return false
        })
        const { container } = render(<StatsNavbarView />, {
            storeState: state,
        })
        const supportPerformanceNavBarBlock = container.querySelector(
            '[data-candu-id="navbar-block-support-performance"]',
        )?.parentElement?.parentElement
        const autoQANavbarLinks = screen
            .getAllByRole('link', { name: new RegExp('Auto QA') })
            .filter((el) => el.getAttribute('href') === '/app/stats/auto-qa')
        expect(supportPerformanceNavBarBlock).toBeInTheDocument()
        const autoQATextInclusion =
            supportPerformanceNavBarBlock?.textContent?.includes('Auto QA')
        expect(autoQATextInclusion).toBe(true)
        expect(autoQANavbarLinks.length).toBe(1)
    })
})
