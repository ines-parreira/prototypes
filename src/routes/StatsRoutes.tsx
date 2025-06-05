import { useEffect } from 'react'

import {
    Redirect,
    Route,
    RouteComponentProps,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'

import { logPageChange } from 'common/segment'
import { AGENT_ROLE } from 'config/user'
import useAppSelector from 'hooks/useAppSelector'
import App from 'pages/App'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import AutomateAiAgentStatsReport from 'pages/stats/automate/ai-agent/AutomateAiAgentStatsReport'
import AiSalesAgentSalesOverview from 'pages/stats/automate/aiSalesAgent/AiSalesAgentSalesOverview'
import AutomateStatsPaywall from 'pages/stats/automate/AutomateStatsPaywall'
import StatsNavbarContainer from 'pages/stats/common/StatsNavbarContainer'
import RevenueCampaignsStats from 'pages/stats/convert/pages/CampaignsStats'
import CampaignStatsPaywallView from 'pages/stats/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import { CampaignStatsFilters } from 'pages/stats/convert/providers/CampaignStatsFilters'
import { DashboardPage } from 'pages/stats/dashboards/DashboardPage'
import { Dashboards } from 'pages/stats/dashboards/Dashboards'
import DefaultStatsFilters from 'pages/stats/DefaultStatsFilters'
import HelpCenterStats from 'pages/stats/help-center/pages/HelpCenterStats'
import LiveAgents from 'pages/stats/live/agents/LiveAgents'
import LiveOverview from 'pages/stats/live/overview/LiveOverview'
import SatisfactionReport from 'pages/stats/quality-management/satisfaction/SatisfactionReport'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'
import {
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
    ROUTE_OLD_PERFORMANCE_BY_FEATURES,
} from 'pages/stats/self-service/constants'
import SelfServiceStatsPage from 'pages/stats/self-service/SelfServiceStatsPage'
import { ServiceLevelAgreements } from 'pages/stats/sla/ServiceLevelAgreements'
import SupportPerformanceAgentsReport from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReport'
import AutoQA from 'pages/stats/support-performance/auto-qa/AutoQA'
import { BusiestTimesOfDays } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays'
import { ChannelsReport } from 'pages/stats/support-performance/channels/ChannelsReport'
import SupportPerformanceOverviewReport from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReport'
import SupportPerformanceRevenue from 'pages/stats/support-performance/revenue/SupportPerformanceRevenue'
import SupportPerformanceSatisfaction from 'pages/stats/support-performance/satisfaction/SupportPerformanceSatisfaction'
import AutomateIntents from 'pages/stats/ticket-insights/intents/AutomateIntents'
import AutomateMacros from 'pages/stats/ticket-insights/macros/AutomateMacros'
import { Tags } from 'pages/stats/ticket-insights/tags/Tags'
import { SupportPerformanceTicketInsights } from 'pages/stats/ticket-insights/ticket-fields/SupportPerformanceTicketInsights'
import LiveVoice from 'pages/stats/voice/pages/LiveVoice'
import VoiceAgents from 'pages/stats/voice/pages/VoiceAgents'
import VoiceOverview from 'pages/stats/voice/pages/VoiceOverview'
import { STATS_ROUTES } from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'
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

    const hasLiveOverviewFeature = useAppSelector(
        currentAccountHasFeature(AccountFeature.OverviewLiveStatistics),
    )

    const hasAutomate = useAppSelector(getHasAutomate)

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
                        exact
                        path={`${path}/${STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT}`}
                        render={() => (
                            <App
                                content={ServiceLevelAgreements}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>

                {hasAutomate && (
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
                        exact
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
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.AUTOMATE_OVERVIEW}`}
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
                    path={`${path}/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`}
                >
                    <Route
                        exact
                        path={`${path}/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`}
                        render={() => (
                            <App
                                content={AiSalesAgentSalesOverview}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                </ProtectedRoute>
            </Switch>
        </DefaultStatsFilters>
    )
}
