import type { ComponentType, PropsWithChildren, ReactNode } from 'react'
import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { logPageChange } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { UserRole } from 'config/types/user'
import AutomateAiAgentStatsReport from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentStatsReport'
import AiSalesAgentSalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentSalesOverview'
import AutomateStatsPaywall from 'domains/reporting/pages/automate/AutomateStatsPaywall'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import StatsNavbarContainer from 'domains/reporting/pages/common/StatsNavbarContainer'
import RevenueCampaignsStats from 'domains/reporting/pages/convert/pages/CampaignsStats'
import CampaignStatsPaywallView from 'domains/reporting/pages/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import { CampaignStatsFilters } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters'
import { DashboardPage } from 'domains/reporting/pages/dashboards/DashboardPage'
import { Dashboards } from 'domains/reporting/pages/dashboards/Dashboards'
import HelpCenterStats from 'domains/reporting/pages/help-center/pages/HelpCenterStats'
import LiveAgents from 'domains/reporting/pages/live/agents/LiveAgents'
import LiveOverview from 'domains/reporting/pages/live/overview/LiveOverview'
import SatisfactionReport from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReport'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import SelfServiceStatsPage from 'domains/reporting/pages/self-service/SelfServiceStatsPage'
import { ServiceLevelAgreements } from 'domains/reporting/pages/sla/ServiceLevelAgreements'
import SupportPerformanceAgentsReport from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReport'
import AutoQA from 'domains/reporting/pages/support-performance/auto-qa/AutoQA'
import { BusiestTimesOfDays } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDays'
import { ChannelsReport } from 'domains/reporting/pages/support-performance/channels/ChannelsReport'
import SupportPerformanceOverviewReport from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReport'
import SupportPerformanceRevenue from 'domains/reporting/pages/support-performance/revenue/SupportPerformanceRevenue'
import SupportPerformanceSatisfaction from 'domains/reporting/pages/support-performance/satisfaction/SupportPerformanceSatisfaction'
import AutomateIntents from 'domains/reporting/pages/ticket-insights/intents/AutomateIntents'
import AutomateMacros from 'domains/reporting/pages/ticket-insights/macros/AutomateMacros'
import { Tags } from 'domains/reporting/pages/ticket-insights/tags/Tags'
import { SupportPerformanceTicketInsights } from 'domains/reporting/pages/ticket-insights/ticket-fields/SupportPerformanceTicketInsights'
import LiveVoice from 'domains/reporting/pages/voice/pages/LiveVoice'
import VoiceAgents from 'domains/reporting/pages/voice/pages/VoiceAgents'
import VoiceOverview from 'domains/reporting/pages/voice/pages/VoiceOverview'
import { StatsRoutes } from 'domains/reporting/routes/StatsRoutes'
import * as billingFixtures from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/productPrices'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { AnalyticsAiAgentLayout } from 'pages/aiAgent/analyticsAiAgent/components/AnalyticsAiAgentLayout'
import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { STATS_ROUTES } from 'routes/constants'
import { initialState } from 'state/billing/reducers'

jest.mock('@repo/logging')
const logPageMock = assumeMock(logPageChange)

jest.mock(
    'pages/App',
    () =>
        ({
            content: Content,
            children,
        }: {
            content?: ComponentType<any>
            children?: ReactNode
        }) =>
            Content ? <Content /> : children,
)
jest.mock('pages/PanelLayout', () => () => <div>PanelLayout</div>)

jest.mock(
    'domains/reporting/pages/DefaultStatsFilters',
    () =>
        ({ children }: PropsWithChildren<any>) => {
            return (
                <>
                    <div>Default stats filters</div>
                    <>{children}</>
                </>
            )
        },
)

const mockStore = configureMockStore()

const defaultState = {
    currentAccount: fromJS({
        current_subscription: {
            products: {},
        },
    }),
    billing: initialState.mergeDeep(billingFixtures.billingState),
    integrations: fromJS({
        integrations: [],
    }),
    currentUser: fromJS({
        id: 1,
        role: { name: 'admin' },
    }),
}

jest.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)

jest.mock('hooks/aiAgent/useAiAgentAccess')
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Switch: ({ children }: { children: React.ReactNode }) => children,
    Route: ({
        render,
        path,
    }: {
        path: string
        render: (data: any) => React.ReactNode
    }) => (render ? render({ match: { path } }) : null),
    useLocation: () => ({
        pathname: '/app/settings',
        search: '',
        state: undefined,
        hash: '',
    }),
    useRouteMatch: () => ({
        path: '/app/stats',
        url: '/app/stats',
        params: {},
        isExact: true,
    }),
}))

jest.mock('domains/reporting/pages/common/StatsNavbarContainer')
const StatsNavbarContainerMock = assumeMock(StatsNavbarContainer)
jest.mock('domains/reporting/pages/report-chart-restrictions/ProtectedRoute')
const ProtectedRouteMock = assumeMock(ProtectedRoute)
jest.mock('domains/reporting/pages/live/overview/LiveOverview')
const LiveOverviewMock = assumeMock(LiveOverview)
jest.mock('domains/reporting/pages/live/agents/LiveAgents')
const LiveAgentsMock = assumeMock(LiveAgents)
jest.mock('domains/reporting/pages/voice/pages/LiveVoice')
const LiveVoiceMock = assumeMock(LiveVoice)
jest.mock(
    'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReport',
)
const SupportPerformanceOverviewReportMock = assumeMock(
    SupportPerformanceOverviewReport,
)
jest.mock('domains/reporting/pages/dashboards/Dashboards')
const DashboardsMock = assumeMock(Dashboards)
jest.mock('domains/reporting/pages/dashboards/DashboardPage')
const DashboardPageMock = assumeMock(DashboardPage)
jest.mock(
    'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDays',
)
const BusiestTimesOfDaysMock = assumeMock(BusiestTimesOfDays)
jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/SupportPerformanceTicketInsights',
)
const SupportPerformanceTicketInsightsMock = assumeMock(
    SupportPerformanceTicketInsights,
)
jest.mock('domains/reporting/pages/ticket-insights/tags/Tags')
const TagsMock = assumeMock(Tags)
jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/SatisfactionReport',
)
const SatisfactionMock = assumeMock(SatisfactionReport)
jest.mock('domains/reporting/pages/support-performance/channels/ChannelsReport')
const ChannelsReportMock = assumeMock(ChannelsReport)
jest.mock('domains/reporting/pages/sla/ServiceLevelAgreements')
const ServiceLevelAgreementsMock = assumeMock(ServiceLevelAgreements)
jest.mock(
    'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReport',
)
const SupportPerformanceAgentsReportMock = assumeMock(
    SupportPerformanceAgentsReport,
)
jest.mock(
    'domains/reporting/pages/support-performance/satisfaction/SupportPerformanceSatisfaction',
)
const SupportPerformanceSatisfactionMock = assumeMock(
    SupportPerformanceSatisfaction,
)
jest.mock(
    'domains/reporting/pages/support-performance/revenue/SupportPerformanceRevenue',
)
const SupportPerformanceRevenueMock = assumeMock(SupportPerformanceRevenue)
jest.mock('domains/reporting/pages/convert/pages/CampaignsStats')
const RevenueCampaignsStatsMock = assumeMock(RevenueCampaignsStats)
jest.mock(
    'domains/reporting/pages/convert/pages/CampaignsStats/CampaignStatsPaywallView',
)
const CampaignStatsPaywallViewMock = assumeMock(CampaignStatsPaywallView)
jest.mock('domains/reporting/pages/convert/providers/CampaignStatsFilters')
const CampaignStatsFiltersMock = assumeMock(CampaignStatsFilters)
jest.mock('domains/reporting/pages/ticket-insights/macros/AutomateMacros')
const AutomateMacrosMock = assumeMock(AutomateMacros)
jest.mock('domains/reporting/pages/ticket-insights/intents/AutomateIntents')
const AutomateIntentsMock = assumeMock(AutomateIntents)
jest.mock('domains/reporting/pages/automate/AutomateStatsPaywall')
const AutomateStatsPaywallMock = assumeMock(AutomateStatsPaywall)
jest.mock(
    'domains/reporting/pages/automate/ai-agent/AutomateAiAgentStatsReport',
)
const AutomateAiAgentStatsReportMock = assumeMock(AutomateAiAgentStatsReport)
jest.mock('domains/reporting/pages/self-service/SelfServiceStatsPage')
const SelfServiceStatsPageMock = assumeMock(SelfServiceStatsPage)
jest.mock('domains/reporting/pages/help-center/pages/HelpCenterStats')
const HelpCenterStatsMock = assumeMock(HelpCenterStats)
jest.mock('domains/reporting/pages/voice/pages/VoiceOverview')
const VoiceOverviewMock = assumeMock(VoiceOverview)
jest.mock('domains/reporting/pages/voice/pages/VoiceAgents')
const VoiceAgentsMock = assumeMock(VoiceAgents)
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const HelpCenterApiClientProviderMock = assumeMock(HelpCenterApiClientProvider)
jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
const SupportedLocalesProviderMock = assumeMock(SupportedLocalesProvider)
jest.mock('pages/convert/common/hooks/useConvertApi')
const RevenueAddonApiClientProviderMock = assumeMock(
    RevenueAddonApiClientProvider,
)
jest.mock('domains/reporting/pages/support-performance/auto-qa/AutoQA')
const AutoQAMock = assumeMock(AutoQA)
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentSalesOverview',
)
const AiSalesAgentSalesOverviewMock = assumeMock(AiSalesAgentSalesOverview)

// Mock the SalesPaywallMiddleware to simply render the component it wraps
jest.mock('pages/aiAgent/Overview/middlewares/SalesPaywallMiddleware', () => ({
    SalesPaywallMiddleware: (Component: ComponentType) => Component,
}))
jest.mock('pages/aiAgent/analyticsAiAgent/components/AnalyticsAiAgentLayout')
const AnalyticsAiAgentLayoutMock = assumeMock(AnalyticsAiAgentLayout)

describe('StatsRoutes', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        ChannelsReportMock.mockImplementation(() => <div />)
        ServiceLevelAgreementsMock.mockImplementation(() => <div />)
        AutoQAMock.mockImplementation(() => <div />)
        SatisfactionMock.mockImplementation(() => <div />)
        TagsMock.mockImplementation(() => <div />)
        DashboardPageMock.mockImplementation(() => <div />)
        DashboardsMock.mockImplementation(() => <div />)
        StatsNavbarContainerMock.mockImplementation(() => <div />)
        ProtectedRouteMock.mockImplementation(({ children }) => children)
        SupportPerformanceOverviewReportMock.mockImplementation(() => <div />)
        LiveOverviewMock.mockImplementation(() => <div />)
        LiveAgentsMock.mockImplementation(() => <div />)
        LiveVoiceMock.mockImplementation(() => <div />)
        BusiestTimesOfDaysMock.mockImplementation(() => <div />)
        SupportPerformanceTicketInsightsMock.mockImplementation(() => <div />)
        SupportPerformanceAgentsReportMock.mockImplementation(() => <div />)
        SupportPerformanceSatisfactionMock.mockImplementation(() => <div />)
        SupportPerformanceRevenueMock.mockImplementation(() => <div />)
        RevenueCampaignsStatsMock.mockImplementation(() => <div />)
        CampaignStatsFiltersMock.mockImplementation(({ children }) => (
            <>{children}</>
        ))
        CampaignStatsPaywallViewMock.mockImplementation(() => <div />)
        AutomateMacrosMock.mockImplementation(() => <div />)
        AutomateIntentsMock.mockImplementation(() => <div />)
        AutomateStatsPaywallMock.mockImplementation(() => <div />)
        SelfServiceStatsPageMock.mockImplementation(() => <div />)
        HelpCenterStatsMock.mockImplementation(() => <div />)
        VoiceOverviewMock.mockImplementation(() => <div />)
        VoiceAgentsMock.mockImplementation(() => <div />)
        AiSalesAgentSalesOverviewMock.mockImplementation(() => <div />)
        RevenueAddonApiClientProviderMock.mockImplementation(({ children }) => (
            <>{children}</>
        ))
        AutomateAiAgentStatsReportMock.mockImplementation(() => <div />)
        RevenueAddonApiClientProviderMock.mockImplementation(({ children }) => (
            <>{children}</>
        ))
        HelpCenterApiClientProviderMock.mockImplementation(({ children }) => (
            <>{children}</>
        ))
        SupportedLocalesProviderMock.mockImplementation(({ children }) => (
            <>{children}</>
        ))
        AnalyticsAiAgentLayoutMock.mockImplementation(() => <div />)
    })

    it.each([
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.LIVE_OVERVIEW}`,
            mock: LiveOverviewMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.LIVE_AGENTS}`,
            mock: LiveAgentsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.LIVE_VOICE}`,
            mock: LiveVoiceMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.DASHBOARDS_NEW}`,
            mock: DashboardsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.DASHBOARDS_PAGE}`,
            mock: DashboardPageMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`,
            mock: SupportPerformanceOverviewReportMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`,
            mock: SupportPerformanceAgentsReportMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_BUSIEST_TIMES}`,
            mock: BusiestTimesOfDaysMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_CHANNELS}`,
            mock: ChannelsReportMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION}`,
            mock: SupportPerformanceSatisfactionMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_REVENUE}`,
            mock: SupportPerformanceRevenueMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT}`,
            mock: ServiceLevelAgreementsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER}`,
            mock: HelpCenterStatsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_TICKET_FIELDS}`,
            mock: SupportPerformanceTicketInsightsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_TAGS}`,
            mock: TagsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_MACROS}`,
            mock: AutomateMacrosMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_INTENTS}`,
            mock: AutomateIntentsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION}`,
            mock: SatisfactionMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.CONVERT_CAMPAIGNS}`,
            mock: RevenueCampaignsStatsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_OVERVIEW}`,
            mock: VoiceOverviewMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_AGENTS}`,
            mock: VoiceAgentsMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.AUTOMATE_AI_AGENTS}`,
            mock: AutomateAiAgentStatsReportMock,
        },
        {
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}/:shopName?`,
            mock: AiSalesAgentSalesOverviewMock,
        },
    ])('should render %p page', ({ route, mock }) => {
        render(
            <Provider store={mockStore(defaultState)}>
                <MemoryRouter initialEntries={[route]}>
                    <StatsRoutes />
                </MemoryRouter>
            </Provider>,
        )

        expect(mock).toHaveBeenCalled()
        expect(ProtectedRouteMock).toHaveBeenCalledWith(
            expect.objectContaining({ path: route }),
            {},
        )
    })

    it.each([UserRole.Agent, UserRole.Admin])(
        'should render AutoQA page',
        (role) => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            const state = {
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
                billing: initialState.mergeDeep(billingFixtures.billingState),
            }

            const route = `${STATS_ROUTE_PREFIX}${STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA}`

            render(
                <Provider store={mockStore(state)}>
                    <MemoryRouter initialEntries={[route]}>
                        <StatsRoutes />
                    </MemoryRouter>
                </Provider>,
            )

            expect(AutoQAMock).toHaveBeenCalled()
        },
    )

    it('should log page change after location change to a tracked page', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <MemoryRouter initialEntries={['/app/stats']}>
                    <StatsRoutes />
                </MemoryRouter>
            </Provider>,
        )

        expect(logPageMock).toHaveBeenCalledTimes(1)
    })
})
