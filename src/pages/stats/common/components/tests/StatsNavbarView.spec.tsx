import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/productPrices'
import { useDashboardActions } from 'hooks/reporting/dashboards/useDashboardActions'
import { IntegrationType } from 'models/integration/constants'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import { getDashboardPath } from 'pages/stats/dashboards/utils'
import { SERVICE_LEVEL_AGREEMENT_PAGE_TITLE } from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'
import { AUTO_QA_PAGE_TITLE } from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'
import { STATS_ROUTES } from 'routes/constants'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { StatsNavbarView } from '../StatsNavbarView/StatsNavbarView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

jest.mock('hooks/reporting/dashboards/useDashboardActions')
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
    })

    it('should render the link to new busiest times of days', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

        expect(screen.getByText('Busiest Times')).toBeInTheDocument()
    })

    describe('New Agents Performance', () => {
        it('should render the link to new agents page when having flag enabled', () => {
            renderWithRouter(
                <Provider store={mockStore(defaultState)}>
                    <StatsNavbarView />
                </Provider>,
            )

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
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

        expect(screen.getByText('Campaigns')).toBeInTheDocument()
    })

    it('should render the link to the Help Center Stats when having access to the feature', () => {
        mockFlags({
            [FeatureFlagKey.HelpCenterAnalytics]: true,
        })
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

        expect(screen.getByText('Help Center')).toBeInTheDocument()
    })

    it('should render the link to the Voice Overview', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

        expect(screen.getAllByText('Voice')).toHaveLength(2)
        expect(screen.getAllByText('Agents')).toHaveLength(3)
    })

    it('should render the link to the Service Level Agreements', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

        expect(
            screen.getByText(SERVICE_LEVEL_AGREEMENT_PAGE_TITLE),
        ).toBeInTheDocument()
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
                                basicMonthlyAutomationPlan.price_id,
                        },
                    },
                }),
            }

            renderWithRouter(
                <Provider store={mockStore(state)}>
                    <StatsNavbarView />
                </Provider>,
            )

            expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        },
    )

    it('should render the link to the New Tags Report page', () => {
        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

        const TagsReportLink = container.querySelector(
            'a[href="/app/stats/tags"]',
        )

        expect(TagsReportLink).toBeInTheDocument()
    })

    it('should render the link to the New Channels Reports', () => {
        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )
        const newChannelsReportLink = container.querySelector(
            'a[href="/app/stats/channels"]',
        )
        expect(newChannelsReportLink).toBeInTheDocument()
    })

    it('should render the link to the New Satisfaction Report', () => {
        mockFlags({
            [FeatureFlagKey.NewSatisfactionReport]: true,
        })

        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )
        const newSatisfactionReportLink = container.querySelector(
            'a[href="/app/stats/quality-management-satisfaction"]',
        )
        const newBadgeText = newSatisfactionReportLink?.children?.[0]?.innerHTML

        expect(newSatisfactionReportLink).toBeInTheDocument()
        expect(newBadgeText).toBe('NEW')
    })

    it('should render only the New Satisfaction Report when new-satisfaction-report is enabled', () => {
        mockFlags({
            [FeatureFlagKey.NewSatisfactionReport]: true,
        })

        const { getAllByText } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

        const satisfactionReportLinks = getAllByText('Satisfaction')

        expect(satisfactionReportLinks.length).toBe(1)
    })

    it('should render the link to the Live Voice', () => {
        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

        const liveVoiceLink = container.querySelector(
            'a[href="/app/stats/live-voice"]',
        )
        expect(liveVoiceLink).toBeInTheDocument()
    })

    it('should render the link to the Dashboards', () => {
        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>,
        )

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
                            basicMonthlyAutomationPlan.price_id,
                    },
                },
            }),
        }

        mockFlags({
            [FeatureFlagKey.NewSatisfactionReport]: true,
        })

        const { container } = renderWithRouter(
            <Provider store={mockStore(state)}>
                <StatsNavbarView />
            </Provider>,
        )
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
                            basicMonthlyAutomationPlan.price_id,
                    },
                },
            }),
        }

        mockFlags({
            [FeatureFlagKey.NewSatisfactionReport]: false,
        })

        const { container } = renderWithRouter(
            <Provider store={mockStore(state)}>
                <StatsNavbarView />
            </Provider>,
        )
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
