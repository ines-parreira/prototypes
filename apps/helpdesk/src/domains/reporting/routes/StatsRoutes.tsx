import { useEffect } from 'react'

import { logPageChange } from '@repo/logging'
import type { RouteComponentProps } from 'react-router-dom'
import {
    Redirect,
    Route,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

import { AGENT_ROLE } from 'config/user'
import AutomateAiAgentStatsReport from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentStatsReport'
import AiSalesAgentSalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentSalesOverview'
import AutomateStatsPaywall from 'domains/reporting/pages/automate/AutomateStatsPaywall'
import StatsNavbarContainer from 'domains/reporting/pages/common/StatsNavbarContainer'
import RevenueCampaignsStats from 'domains/reporting/pages/convert/pages/CampaignsStats'
import CampaignStatsPaywallView from 'domains/reporting/pages/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import { CampaignStatsFilters } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters'
import { DashboardPage } from 'domains/reporting/pages/dashboards/DashboardPage'
import { Dashboards } from 'domains/reporting/pages/dashboards/Dashboards'
import DefaultStatsFilters from 'domains/reporting/pages/DefaultStatsFilters'
import HelpCenterStats from 'domains/reporting/pages/help-center/pages/HelpCenterStats'
import LiveAgents from 'domains/reporting/pages/live/agents/LiveAgents'
import LiveOverview from 'domains/reporting/pages/live/overview/LiveOverview'
import SatisfactionReport from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReport'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import {
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
    ROUTE_OLD_PERFORMANCE_BY_FEATURES,
} from 'domains/reporting/pages/self-service/constants'
import { SelfServiceStatsPage } from 'domains/reporting/pages/self-service/SelfServiceStatsPage'
import { ServiceLevelAgreementsPage } from 'domains/reporting/pages/sla/ServiceLevelAgreementsPage'
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
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import AnalyticsAiAgentStatsPaywall from 'pages/aiAgent/analyticsAiAgent/components/AnalyticsAiAgentStatsPaywall'
import { AnalyticsOverviewStatsPaywall } from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewStatsPaywall/AnalyticsOverviewStatsPaywall'
import { SalesPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/SalesPaywallMiddleware'
import App from 'pages/App'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { STATS_ROUTES } from 'routes/constants'
import { currentAccountHasFeature } from 'state/currentAccount/selectors'
import { AccountFeature } from 'state/currentAccount/types'

function HelpCenterStatsRoutes({ match: { path } }: RouteComponentProps) {
    return (
        <HelpCenterApiClientProvider>
            <SupportedLocalesProvider>
                <Switch>
                    <Route
                        path={`${path}`}
                        exact
                        render={() => (
                            <App
                                content={HelpCenterStats}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </Switch>
            </SupportedLocalesProvider>
        </HelpCenterApiClientProvider>
    )
}

export const StatsRoutes = () => {
    const location = useLocation()
    const { path } = useRouteMatch()
    const { hasAccess } = useAiAgentAccess()

    const hasLiveOverviewFeature = useAppSelector(
        currentAccountHasFeature(AccountFeature.OverviewLiveStatistics),
    )

    useEffect(logPageChange, [location.pathname])

    return (
        <DefaultStatsFilters
            notReadyFallback={
                <Route
                    render={() => (
                        <App navbar={StatsNavbarContainer}>{null}</App>
                    )}
                />
            }
        >
            <Switch>
                <Route exact path={`${path}/`}>
                    <Redirect
                        to={`${path}/${
                            hasLiveOverviewFeature
                                ? STATS_ROUTES.LIVE_OVERVIEW
                                : STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW
                        }`}
                    />
                </Route>

                <ProtectedRoute path={`${path}/${STATS_ROUTES.LIVE_OVERVIEW}`}>
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.LIVE_OVERVIEW}`}
                        render={() => (
                            <App
                                content={LiveOverview}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute path={`${path}/${STATS_ROUTES.LIVE_AGENTS}`}>
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.LIVE_AGENTS}`}
                        render={() => (
                            <App
                                content={LiveAgents}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute path={`${path}/${STATS_ROUTES.LIVE_VOICE}`}>
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.LIVE_VOICE}`}
                        render={() => (
                            <App
                                content={LiveVoice}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`}
                        render={() => (
                            <App
                                content={SupportPerformanceOverviewReport}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute path={`${path}/${STATS_ROUTES.DASHBOARDS_NEW}`}>
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.DASHBOARDS_NEW}`}
                        render={() => (
                            <HelpCenterApiClientProvider>
                                <SupportedLocalesProvider>
                                    <RevenueAddonApiClientProvider>
                                        <CampaignStatsFilters>
                                            <App
                                                content={Dashboards}
                                                navbar={StatsNavbarContainer}
                                            />
                                        </CampaignStatsFilters>
                                    </RevenueAddonApiClientProvider>
                                </SupportedLocalesProvider>
                            </HelpCenterApiClientProvider>
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.DASHBOARDS_PAGE}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.DASHBOARDS_PAGE}`}
                        render={() => (
                            <HelpCenterApiClientProvider>
                                <SupportedLocalesProvider>
                                    <RevenueAddonApiClientProvider>
                                        <CampaignStatsFilters>
                                            <App
                                                content={DashboardPage}
                                                navbar={StatsNavbarContainer}
                                            />
                                        </CampaignStatsFilters>
                                    </RevenueAddonApiClientProvider>
                                </SupportedLocalesProvider>
                            </HelpCenterApiClientProvider>
                        )}
                    />
                </ProtectedRoute>

                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_BUSIEST_TIMES}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_BUSIEST_TIMES}`}
                        render={() => (
                            <App
                                content={BusiestTimesOfDays}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.TICKET_INSIGHTS_TICKET_FIELDS}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.TICKET_INSIGHTS_TICKET_FIELDS}`}
                        render={() => (
                            <App
                                content={SupportPerformanceTicketInsights}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.TICKET_INSIGHTS_TAGS}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.TICKET_INSIGHTS_TAGS}`}
                        render={() => (
                            <App content={Tags} navbar={StatsNavbarContainer} />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION}`}
                        render={() => (
                            <App
                                content={SatisfactionReport}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_CHANNELS}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_CHANNELS}`}
                        render={() => (
                            <App
                                content={ChannelsReport}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT}`}
                >
                    <Route
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT}`}
                        render={() => (
                            <App
                                content={ServiceLevelAgreementsPage}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>

                {hasAccess && (
                    <ProtectedRoute
                        path={`${path}/${STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA}`}
                    >
                        <Route
                            exact
                            path={`${path}/${STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA}`}
                            render={() => (
                                <App
                                    content={withUserRoleRequired(
                                        AutoQA,
                                        AGENT_ROLE,
                                    )}
                                    navbar={StatsNavbarContainer}
                                />
                            )}
                        />
                    </ProtectedRoute>
                )}

                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`}
                >
                    <Route
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`}
                        render={() => (
                            <App
                                content={SupportPerformanceAgentsReport}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION}`}
                        render={() => (
                            <App
                                content={SupportPerformanceSatisfaction}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_REVENUE}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_REVENUE}`}
                        render={() => (
                            <RevenueAddonApiClientProvider>
                                <App
                                    content={SupportPerformanceRevenue}
                                    navbar={StatsNavbarContainer}
                                />
                            </RevenueAddonApiClientProvider>
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute path={`${path}/revenue/campaigns`}>
                    <Route exact path={`${path}/revenue/campaigns`}>
                        <Redirect
                            to={`${path}/${STATS_ROUTES.CONVERT_CAMPAIGNS}`}
                        />
                    </Route>
                </ProtectedRoute>
                <ProtectedRoute path={`${path}/convert/campaigns/subscribe`}>
                    <Route
                        path={`${path}/convert/campaigns/subscribe`}
                        exact
                        render={() => (
                            <App
                                content={CampaignStatsPaywallView}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.CONVERT_CAMPAIGNS}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.CONVERT_CAMPAIGNS}`}
                        render={() => (
                            <RevenueAddonApiClientProvider>
                                <App
                                    content={RevenueCampaignsStats}
                                    navbar={StatsNavbarContainer}
                                />
                            </RevenueAddonApiClientProvider>
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.TICKET_INSIGHTS_MACROS}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.TICKET_INSIGHTS_MACROS}`}
                        render={() => (
                            <App
                                content={AutomateMacros}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.TICKET_INSIGHTS_INTENTS}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.TICKET_INSIGHTS_INTENTS}`}
                        render={() => (
                            <App
                                content={AutomateIntents}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.AUTOMATE_OVERVIEW}`}
                >
                    <Redirect
                        to={`${path}/${STATS_ROUTES.AI_AGENT_OVERVIEW}`}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.AI_AGENT_OVERVIEW}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.AI_AGENT_OVERVIEW}`}
                        render={() => (
                            <App
                                content={AutomateStatsPaywall}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`}
                        render={() => (
                            <App
                                navbar={StatsNavbarContainer}
                                content={AutomateAiAgentStatsReport}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute path={`${path}/${STATS_ROUTES.AI_AGENT}`}>
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.AI_AGENT}`}
                        render={() => (
                            <App
                                navbar={StatsNavbarContainer}
                                content={AnalyticsAiAgentStatsPaywall}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.ANALYTICS_OVERVIEW}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.ANALYTICS_OVERVIEW}`}
                        render={() => (
                            <App
                                navbar={StatsNavbarContainer}
                                content={AnalyticsOverviewStatsPaywall}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.ANALYTICS_AI_AGENT}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.ANALYTICS_AI_AGENT}`}
                        render={() => (
                            <App
                                navbar={StatsNavbarContainer}
                                content={AnalyticsAiAgentStatsPaywall}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${ROUTE_OLD_PERFORMANCE_BY_FEATURES}`}
                >
                    <Route
                        exact
                        path={`${path}/${ROUTE_OLD_PERFORMANCE_BY_FEATURES}`}
                    >
                        <Redirect
                            to={`${path}/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`}
                        />
                    </Route>
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`}
                >
                    <Route
                        exact
                        path={`${path}/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`}
                        render={() => (
                            <HelpCenterApiClientProvider>
                                <App
                                    content={SelfServiceStatsPage}
                                    navbar={StatsNavbarContainer}
                                />
                            </HelpCenterApiClientProvider>
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER}`}
                        render={HelpCenterStatsRoutes}
                    />
                </ProtectedRoute>
                <ProtectedRoute path={`${path}/${STATS_ROUTES.VOICE_OVERVIEW}`}>
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.VOICE_OVERVIEW}`}
                        render={() => (
                            <App
                                content={VoiceOverview}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute path={`${path}/${STATS_ROUTES.VOICE_AGENTS}`}>
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.VOICE_AGENTS}`}
                        render={() => (
                            <App
                                content={VoiceAgents}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${path}/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}/:shopName?`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}/:shopName?`}
                        render={() => (
                            <App
                                content={SalesPaywallMiddleware(
                                    AiSalesAgentSalesOverview,
                                )}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
            </Switch>
        </DefaultStatsFilters>
    )
}
