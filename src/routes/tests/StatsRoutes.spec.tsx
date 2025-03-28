import React, { ComponentType, PropsWithChildren, ReactNode } from 'react'

import { act, render } from '@testing-library/react'
import { createBrowserHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { logPageChange } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import * as billingFixtures from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
} from 'fixtures/productPrices'
import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import AutomateAiAgentStatsReport from 'pages/stats/automate/ai-agent/AutomateAiAgentStatsReport'
import AiSalesAgentSalesOverview from 'pages/stats/automate/aiSalesAgent/AiSalesAgentSalesOverview'
import AutomateStatsPaywall from 'pages/stats/automate/AutomateStatsPaywall'
import AutomateIntents from 'pages/stats/AutomateIntents'
import AutomateMacros from 'pages/stats/AutomateMacros'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import StatsNavbarContainer from 'pages/stats/common/StatsNavbarContainer'
import RevenueCampaignsStats from 'pages/stats/convert/pages/CampaignsStats'
import CampaignStatsPaywallView from 'pages/stats/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import { CampaignStatsFilters } from 'pages/stats/convert/providers/CampaignStatsFilters'
import { DashboardPage } from 'pages/stats/dashboards/DashboardPage'
import { Dashboards } from 'pages/stats/dashboards/Dashboards'
import HelpCenterStats from 'pages/stats/help-center/pages/HelpCenterStats'
import LiveAgents from 'pages/stats/LiveAgents'
import LiveOverview from 'pages/stats/LiveOverview'
import SatisfactionReport from 'pages/stats/quality-management/satisfaction/SatisfactionReport'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'
import SelfServiceStatsPage from 'pages/stats/self-service/SelfServiceStatsPage'
import { ServiceLevelAgreements } from 'pages/stats/sla/ServiceLevelAgreements'
import SupportPerformanceAgentsReport from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReport'
import AutoQA from 'pages/stats/support-performance/auto-qa/AutoQA'
import { BusiestTimesOfDays } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays'
import { ChannelsReport } from 'pages/stats/support-performance/channels/ChannelsReport'
import SupportPerformanceOverviewReport from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReport'
import SupportPerformanceRevenue from 'pages/stats/support-performance/revenue/SupportPerformanceRevenue'
import SupportPerformanceSatisfaction from 'pages/stats/support-performance/satisfaction/SupportPerformanceSatisfaction'
import { Tags } from 'pages/stats/ticket-insights/tags/Tags'
import { SupportPerformanceTicketInsights } from 'pages/stats/ticket-insights/ticket-fields/SupportPerformanceTicketInsights'
import LiveVoice from 'pages/stats/voice/pages/LiveVoice'
import VoiceAgents from 'pages/stats/voice/pages/VoiceAgents'
import VoiceOverview from 'pages/stats/voice/pages/VoiceOverview'
import { STATS_ROUTES } from 'routes/constants'
import { StatsRoutes } from 'routes/StatsRoutes'
import { initialState } from 'state/billing/reducers'
import { assumeMock } from 'utils/testing'

jest.mock('common/segment')
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
    'pages/stats/DefaultStatsFilters',
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

const mockHistory = createBrowserHistory()
const mockStore = configureMockStore()

const defaultState = {
    currentAccount: fromJS({
        current_subscription: {
            products: {},
        },
    }),
    billing: initialState.mergeDeep(billingFixtures.billingState),
}

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = assumeMock(useFlag)

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

jest.mock('pages/stats/common/StatsNavbarContainer')
const StatsNavbarContainerMock = assumeMock(StatsNavbarContainer)
jest.mock('pages/stats/report-chart-restrictions/ProtectedRoute')
const ProtectedRouteMock = assumeMock(ProtectedRoute)
jest.mock('pages/stats/LiveOverview')
const LiveOverviewMock = assumeMock(LiveOverview)
jest.mock('pages/stats/LiveAgents')
const LiveAgentsMock = assumeMock(LiveAgents)
jest.mock('pages/stats/voice/pages/LiveVoice')
const LiveVoiceMock = assumeMock(LiveVoice)
jest.mock(
    'pages/stats/support-performance/overview/SupportPerformanceOverviewReport',
)
const SupportPerformanceOverviewReportMock = assumeMock(
    SupportPerformanceOverviewReport,
)
jest.mock('pages/stats/dashboards/Dashboards')
const DashboardsMock = assumeMock(Dashboards)
jest.mock('pages/stats/dashboards/DashboardPage')
const DashboardPageMock = assumeMock(DashboardPage)
jest.mock(
    'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays',
)
const BusiestTimesOfDaysMock = assumeMock(BusiestTimesOfDays)
jest.mock(
    'pages/stats/ticket-insights/ticket-fields/SupportPerformanceTicketInsights',
)
const SupportPerformanceTicketInsightsMock = assumeMock(
    SupportPerformanceTicketInsights,
)
jest.mock('pages/stats/ticket-insights/tags/Tags')
const TagsMock = assumeMock(Tags)
jest.mock('pages/stats/quality-management/satisfaction/SatisfactionReport')
const SatisfactionMock = assumeMock(SatisfactionReport)
jest.mock('pages/stats/support-performance/channels/ChannelsReport')
const ChannelsReportMock = assumeMock(ChannelsReport)
jest.mock('pages/stats/sla/ServiceLevelAgreements')
const ServiceLevelAgreementsMock = assumeMock(ServiceLevelAgreements)
jest.mock(
    'pages/stats/support-performance/agents/SupportPerformanceAgentsReport',
)
const SupportPerformanceAgentsReportMock = assumeMock(
    SupportPerformanceAgentsReport,
)
jest.mock(
    'pages/stats/support-performance/satisfaction/SupportPerformanceSatisfaction',
)
const SupportPerformanceSatisfactionMock = assumeMock(
    SupportPerformanceSatisfaction,
)
jest.mock('pages/stats/support-performance/revenue/SupportPerformanceRevenue')
const SupportPerformanceRevenueMock = assumeMock(SupportPerformanceRevenue)
jest.mock('pages/stats/convert/pages/CampaignsStats')
const RevenueCampaignsStatsMock = assumeMock(RevenueCampaignsStats)
jest.mock('pages/stats/convert/pages/CampaignsStats/CampaignStatsPaywallView')
const CampaignStatsPaywallViewMock = assumeMock(CampaignStatsPaywallView)
jest.mock('pages/stats/convert/providers/CampaignStatsFilters')
const CampaignStatsFiltersMock = assumeMock(CampaignStatsFilters)
jest.mock('pages/stats/AutomateMacros')
const AutomateMacrosMock = assumeMock(AutomateMacros)
jest.mock('pages/stats/AutomateIntents')
const AutomateIntentsMock = assumeMock(AutomateIntents)
jest.mock('pages/stats/automate/AutomateStatsPaywall')
const AutomateStatsPaywallMock = assumeMock(AutomateStatsPaywall)
jest.mock('pages/stats/automate/ai-agent/AutomateAiAgentStatsReport')
const AutomateAiAgentStatsReportMock = assumeMock(AutomateAiAgentStatsReport)
jest.mock('pages/stats/self-service/SelfServiceStatsPage')
const SelfServiceStatsPageMock = assumeMock(SelfServiceStatsPage)
jest.mock('pages/stats/help-center/pages/HelpCenterStats')
const HelpCenterStatsMock = assumeMock(HelpCenterStats)
jest.mock('pages/stats/voice/pages/VoiceOverview')
const VoiceOverviewMock = assumeMock(VoiceOverview)
jest.mock('pages/stats/voice/pages/VoiceAgents')
const VoiceAgentsMock = assumeMock(VoiceAgents)
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const HelpCenterApiClientProviderMock = assumeMock(HelpCenterApiClientProvider)
jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
const SupportedLocalesProviderMock = assumeMock(SupportedLocalesProvider)
jest.mock('pages/convert/common/hooks/useConvertApi')
const RevenueAddonApiClientProviderMock = assumeMock(
    RevenueAddonApiClientProvider,
)
jest.mock('pages/stats/support-performance/auto-qa/AutoQA')
const AutoQAMock = assumeMock(AutoQA)
jest.mock('pages/stats/automate/aiSalesAgent/AiSalesAgentSalesOverview')
const AiSalesAgentSalesOverviewMock = assumeMock(AiSalesAgentSalesOverview)

describe('StatsRoutes', () => {
    beforeEach(() => {
        mockHistory.replace('/app')
        mockUseFlag.mockReturnValue(false)
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
            mock: ServiceLevelAgreementsMock,
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
            route: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`,
            mock: AiSalesAgentSalesOverviewMock,
        },
    ])('should render %p page', ({ route, mock }) => {
        mockFlags({
            [FeatureFlagKey.NewSatisfactionReport]: true,
            [FeatureFlagKey.AIAgentStatsPage]: true,
            [FeatureFlagKey.StandaloneAiSalesAnalyticsPage]: true,
        })

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
                <StatsRoutes />
            </Provider>,
        )

        act(() => mockHistory.push('/app/stats/live-overview'))

        expect(logPageMock).toHaveBeenCalledTimes(1)
    })
})
