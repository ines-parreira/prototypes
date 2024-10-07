import React, {useEffect} from 'react'
import {
    Redirect,
    Route,
    RouteComponentProps,
    Switch,
    useLocation,
    useParams,
    useRouteMatch,
} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {Tags} from 'pages/stats/ticket-insights/components/Tags'
import AiAgentStatsFilters from 'pages/stats/automate/ai-agent/AiAgentStatsFilters'
import AutomateAiAgentStats from 'pages/stats/automate/ai-agent/AutomateAiAgentStats'
import {logPageChange} from 'common/segment'
import {ADMIN_ROLE, AGENT_ROLE} from 'config/user'
import {PageSection} from 'config/pages'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import useAppSelector from 'hooks/useAppSelector'

import {FeatureFlagKey} from 'config/featureFlags'
import ClickTrackingPaywallView from 'pages/convert/clickTracking/components/ClickTrackingPaywallView/ClickTrackingPaywallView'
import App from 'pages/App'

import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketSourceContainer from 'pages/tickets/detail/TicketSourceContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketPrintContainer from 'pages/tickets/detail/TicketPrintContainer'
import CustomerListContainer from 'pages/customers/list/CustomerListContainer'
import CustomerNavbarContainer from 'pages/customers/common/CustomerNavbarContainer'
import CustomerDetailContainer from 'pages/customers/detail/CustomerDetailContainer'
import CustomerSourceContainer from 'pages/customers/detail/CustomerSourceContainer'
import CustomerInfobarContainer from 'pages/customers/detail/CustomerInfobarContainer'

import SettingsNavbar from 'pages/settings/common/SettingsNavbar/SettingsNavbar'
import StatsNavbarContainer from 'pages/stats/common/StatsNavbarContainer'
import NoMatch from 'pages/common/components/NoMatch'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import AutomateNavbar from 'pages/automate/common/components/AutomateNavbar'

import CanduContent from 'pages/onboarding/CanduContent'
import ReferralContent from 'pages/referral/ReferralContent'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {SupportedLocalesProvider} from 'pages/settings/helpCenter/providers/SupportedLocales'
import AutoQA from 'pages/stats/support-performance/auto-qa/AutoQA'
import DefaultStatsFilters from 'pages/stats/DefaultStatsFilters'
import SupportPerformanceTags from 'pages/stats/SupportPerformanceTags'
import ImportPhoneNumber from 'pages/tasks/detail/ImportPhoneNumber'
import SupportPerformanceAgents from 'pages/stats/support-performance/agents/SupportPerformanceAgents'
import SupportPerformanceSatisfaction from 'pages/stats/SupportPerformanceSatisfaction'
import SupportPerformanceRevenue from 'pages/stats/SupportPerformanceRevenue'
import RevenueCampaignsStats from 'pages/stats/convert/pages/CampaignsStats'
import SupportPerformanceOverview from 'pages/stats/SupportPerformanceOverview'
import LiveOverview from 'pages/stats/LiveOverview'
import LiveAgents from 'pages/stats/LiveAgents'
import AutomateMacros from 'pages/stats/AutomateMacros'
import AutomateIntents from 'pages/stats/AutomateIntents'
import SelfServiceStatsPage from 'pages/stats/self-service/SelfServiceStatsPage'
import TwilioSubaccountStatusForm from 'pages/tasks/detail/TwilioSubaccountStatusForm'
import CreditShopifyBillingIntegration from 'pages/tasks/detail/CreditShopifyBillingIntegration'
import CreateShopifyCharge from 'pages/tasks/detail/CreateShopifyCharge'
import RemoveShopifyBilling from 'pages/tasks/detail/RemoveShopifyBilling'
import {RevenueAddonApiClientProvider} from 'pages/convert/common/hooks/useConvertApi'
import {
    ROUTE_OLD_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_OVERVIEW,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_AI_AGENT,
} from 'pages/stats/self-service/constants'
import CampaignStatsPaywallView from 'pages/stats/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import HelpCenterStats from 'pages/stats/help-center/pages/HelpCenterStats'
import VoiceOverview from 'pages/stats/voice/pages/VoiceOverview'
import VoiceAgents from 'pages/stats/voice/pages/VoiceAgents'
import ClickTrackingSettingsView from 'pages/convert/clickTracking/components/ClickTrackingSettingsView/ClickTrackingSettingsView'
import ConvertNavbar from 'pages/convert/common/components/ConvertNavbar/ConvertNavbar'
import CampaginLibaryView from 'pages/convert/campaigns/components/CampaginLibaryView'
import ABGroupIndexPage from 'pages/convert/abVariants/pages/ABGroupPage'
import {
    CONVERT_ROUTING_CAMPAIGN_PARAM,
    CONVERT_ROUTING_PARAM,
    CONVERT_ROUTING_TEMPLATE_PARAM,
} from 'pages/convert/common/constants'
import ConvertRoute from 'pages/convert/common/components/ConvertRoute/ConvertRoute'
import {CampaignsView} from 'pages/convert/campaigns/CampaignsView'
import CampaignDetailsFactory from 'pages/convert/campaigns/containers/CampaignDetailsFactory'
import {useSplitTicketPage} from 'tickets/pages/SplitTicketPage'
import {useSplitViewPage} from 'tickets/pages/SplitViewPage'
import {useTicketPage} from 'tickets/pages/TicketPage'
import {useViewPage} from 'tickets/pages/ViewPage'
import OrderManagementViewContainer from 'pages/automate/orderManagement/OrderManagementViewContainer'
import ReturnOrderFlowViewContainer from 'pages/automate/orderManagement/returnOrder/ReturnOrderFlowViewContainer'
import TrackOrderFlowViewContainer from 'pages/automate/orderManagement/trackOrder/TrackOrderFlowViewContainer'
import CancelOrderFlowViewContainer from 'pages/automate/orderManagement/cancelOrder/CancelOrderFlowViewContainer'
import ReportOrderIssueFlowViewContainer from 'pages/automate/orderManagement/reportOrderIssue/ReportOrderIssueFlowViewContainer'
import CreateReportOrderIssueFlowScenarioViewContainer from 'pages/automate/orderManagement/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer'
import EditReportOrderIssueFlowScenarioViewContainer from 'pages/automate/orderManagement/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer'
import ArticleRecommendationViewContainer from 'pages/automate/articleRecommendation/ArticleRecommendationViewContainer'
import WorkflowsViewContainer from 'pages/automate/workflows/WorkflowsViewContainer'
import WorkflowEditorViewContainer from 'pages/automate/workflows/editor/WorkflowEditorViewContainer'
import SelfServiceHelpCentersProvider from 'pages/automate/common/providers/SelfServiceHelpCentersProvider'
import OrderManagementPreviewProvider from 'pages/automate/orderManagement/OrderManagementPreviewProvider'
import ConnectedChannelsViewContainer from 'pages/automate/connectedChannels/ConnectedChannelsViewContainer'
import SelfServiceContactFormsProvider from 'pages/automate/common/providers/SelfServiceContactFormsProvider'
import {SupportPerformanceTicketInsights} from 'pages/stats/SupportPerformanceTicketInsights'
import AutomateStatsPaywall from 'pages/stats/AutomateStatsPaywall'
import TrainMyAiViewContainer from 'pages/automate/trainMyAi/TrainMyAiViewContainer'
import ActionsViewContainer from 'pages/automate/actions/ActionsViewContainer'
import ActionsTemplatesViewContainer from 'pages/automate/actions/ActionsTemplatesViewContainer'
import ActionEventsViewContainer from 'pages/automate/actions/ActionEventsViewContainer'
import CreateActionFormView from 'pages/automate/actions/CreateActionFormView'
import EditActionFormView from 'pages/automate/actions/EditActionFormView'
import AutomateLandingPageContainer from 'pages/automate/common/components/AutomateLandingPageContainer'
import ConvertOnboardingView from 'pages/convert/onboarding/components/ConvertOnboardingView'
import AiAgentViewContainer from 'pages/automate/aiAgent/AiAgentViewContainer'
import {AiAgentPlaygroundContainer} from 'pages/automate/aiAgent/AiAgentPlaygroundContainer'
import ConvertBundleView from 'pages/convert/bundles/components/ConvertBundleView'
import ConvertOnboardingWizardView from 'pages/convert/onboarding/components/ConvertOnboardingWizardView'
import UpdateABTestView from 'pages/convert/abTests/components/UpdateABTestView'
import {
    CampaignTemplateCustomizeRecommendationsView,
    CampaignTemplateCustomizeLibraryView,
} from 'pages/convert/campaigns/containers/CampaignTemplateCustomizeView'
import PanelLayout from 'pages/PanelLayout'
import {ServiceLevelAgreements} from 'pages/stats/sla/ServiceLevelAgreements'
import {ChannelsReport} from 'pages/stats/support-performance/channels/ChannelsReport'
import {AiAgentGuidanceContainer} from 'pages/automate/aiAgent/AiAgentGuidanceContainer'
import {AiAgentGuidanceNewContainer} from 'pages/automate/aiAgent/AiAgentGuidanceNewContainer'
import {AiAgentAccountConfigurationProvider} from 'pages/automate/aiAgent/providers/AiAgentAccountConfigurationProvider'
import {AiAgentGuidanceDetailContainer} from 'pages/automate/aiAgent/AiAgentGuidanceDetailContainer'
import {AiAgentGuidanceTemplatesContainer} from 'pages/automate/aiAgent/AiAgentGuidanceTemplatesContainer'
import {AiAgentGuidanceTemplateNewContainer} from 'pages/automate/aiAgent/AiAgentGuidanceTemplateNewContainer'
import {AiAgentErrorBoundary} from 'pages/automate/aiAgent/providers/AiAgentErrorBoundary'

import WorkflowTemplatesViewContainer from 'pages/automate/workflows/WorkflowTemplatesViewContainer'
import {BusiestTimesOfDays} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays'
import useShowAutomateActions from 'pages/automate/actions/hooks/useShowAutomateActions'
import ActionsPlatformAppsView from 'pages/automate/actionsPlatform/ActionsPlatformAppsView'
import ActionsPlatformTemplatesView from 'pages/automate/actionsPlatform/ActionsPlatformTemplatesView'
import {useFlag} from 'common/flags'
import ActionsPlatformCreateAppFormView from 'pages/automate/actionsPlatform/ActionsPlatformCreateAppFormView'
import ActionsPlatformEditAppFormView from 'pages/automate/actionsPlatform/ActionsPlatformEditAppFormView'
import ActionsPlatformEditTemplateViewContainer from 'pages/automate/actionsPlatform/ActionsPlatformEditTemplateViewContainer'
import ActionsPlatformCreateTemplateView from 'pages/automate/actionsPlatform/ActionsPlatformCreateTemplateView'
import {OBS_ADOPT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import WorkflowAnalyticsContainer from 'pages/automate/workflows/analytics/WorkflowAnalyticsContainer'
import AutomateAllRecommendationsContainer from 'pages/automate/common/components/AutomateAllRecommendationsContainer'
import LiveVoice from 'pages/stats/voice/pages/LiveVoice'
import {AiAgentGuidanceLibraryContainer} from 'pages/automate/aiAgent/AiAgentGuidanceLibraryContainer'
import {AiAgentGuidanceAiSuggestionNewContainer} from 'pages/automate/aiAgent/AiAgentGuidanceAiSuggestionNewContainer'
import AiAgentStoreConfigurationProvider from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationProvider'
import AiAgentOnboardingWizard from 'pages/automate/aiAgent/AiAgentOnboardingWizard/AiAgentOnboardingWizard'

import SettingsRoutes from 'routes/settings'
import {ConvertSettingsView} from 'pages/convert/settings/ConvertSettingsView'

export default function Routes() {
    return (
        <Route path="/app">
            <AppRoutes />
        </Route>
    )
}

export function AppRoutes() {
    const {path} = useRouteMatch()

    const splitTicketLayoutProps = useSplitTicketPage()
    const splitViewLayoutProps = useSplitViewPage()
    const fullWidthTicketLayoutProps = useTicketPage()
    const fullWidthViewLayoutProps = useViewPage()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route path={`${path}/tickets`} exact>
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route path={`${path}/tickets/new/:visibility?`} exact>
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route path={`${path}/tickets/search`} exact>
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route path={`${path}/tickets/:viewId/:viewSlug?`} exact>
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route path={`${path}/ticket/:ticketId`} exact>
                <PanelLayout {...fullWidthTicketLayoutProps} />
            </Route>
            <Route path={`${path}/customers`} render={CustomersRoutes} />
            <Route path={`${path}/customer`} render={CustomerRoutes} />
            <Route path={`${path}/users`} render={UsersRoutes} />
            <Route path={`${path}/user`} render={UserRoutes} />
            <Route path={`${path}/ticket`} render={TicketRoutes} />
            <Route path={`${path}/admin/tasks`} render={AdminTasksRoutes} />
            <Route path={`${path}/stats`}>
                <StatsRoutes />
            </Route>
            <Route path={`${path}/automation`} render={AutomationRoutes} />
            <Route path={`${path}/convert`}>
                <ConvertRoutes />
            </Route>
            <Route path={`${path}/settings`}>
                <SettingsRoutes />
            </Route>
            <Route path={`${path}/home`} render={HomepageRoutes} />
            <Route
                path={`${path}/referral-program`}
                exact
                render={() => (
                    <App content={ReferralContent} navbar={TicketNavbar} />
                )}
            />
            <Route exact path={`${path}/views/:viewId?`}>
                <PanelLayout {...splitViewLayoutProps} />
            </Route>
            <Route exact path={`${path}/views/:viewId/:ticketId`}>
                <PanelLayout {...splitTicketLayoutProps} />
            </Route>
            <Route>
                <NoMatch />
            </Route>
        </Switch>
    )
}

export function CustomersRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/new`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/search`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
        </Switch>
    )
}

export function CustomerRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/:customerId`}
                exact
                render={() => (
                    <App
                        content={CustomerDetailContainer}
                        navbar={CustomerNavbarContainer}
                        infobar={CustomerInfobarContainer}
                        infobarOnMobile
                    />
                )}
            />
            <Route
                path={`${path}/:customerId/edit-widgets`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            CustomerSourceContainer,
                            ADMIN_ROLE,
                            undefined,
                            location.pathname.replace('/edit-widgets', '')
                        )}
                        navbar={CustomerNavbarContainer}
                        infobar={CustomerInfobarContainer}
                        isEditingWidgets
                        noContainerWidthLimit
                        containerPadding
                    />
                )}
            />
        </Switch>
    )
}

export function UsersRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/new`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/search`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
        </Switch>
    )
}

export function UserRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/:customerId`}
                exact
                render={() => (
                    <App
                        content={CustomerDetailContainer}
                        navbar={CustomerNavbarContainer}
                        infobar={CustomerInfobarContainer}
                        noContainerWidthLimit
                        infobarOnMobile
                        containerPadding
                    />
                )}
            />
            <Route
                path={`${path}/:customerId/edit-widgets`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            CustomerSourceContainer,
                            ADMIN_ROLE,
                            undefined,
                            location.pathname.replace('/edit-widgets', '')
                        )}
                        navbar={CustomerNavbarContainer}
                        infobar={CustomerInfobarContainer}
                        isEditingWidgets
                        noContainerWidthLimit
                        containerPadding
                    />
                )}
            />
        </Switch>
    )
}

export function TicketRoutes({location, match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/:ticketId/edit-widgets`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            TicketSourceContainer,
                            ADMIN_ROLE,
                            undefined,
                            location.pathname.replace('/edit-widgets', '')
                        )}
                        navbar={TicketNavbar}
                        infobar={TicketInfobarContainer}
                        noContainerWidthLimit
                        isEditingWidgets
                        containerPadding
                    />
                )}
            />
            <Route
                path={`${path}/:ticketId/print`}
                exact
                render={() => <App content={TicketPrintContainer} />}
            />
        </Switch>
    )
}

export function StatsRoutes() {
    const location = useLocation()
    const {path} = useRouteMatch()

    const hasLiveOverviewFeature = useAppSelector(
        currentAccountHasFeature(AccountFeature.OverviewLiveStatistics)
    )

    const isAutoQAEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsAutoQA]

    const isNewTagsReportEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.NewTagsReport]

    const isAiAgentStatsPageEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AIAgentStatsPage]

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
                                ? 'live-overview'
                                : 'support-performance-overview'
                        }`}
                    />
                </Route>
                <Route
                    exact
                    path={`${path}/live-overview`}
                    render={() => (
                        <App
                            content={LiveOverview}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/live-agents`}
                    render={() => (
                        <App
                            content={LiveAgents}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/live-voice`}
                    render={() => (
                        <App
                            content={LiveVoice}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/support-performance-overview`}
                    render={() => (
                        <App
                            content={SupportPerformanceOverview}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/busiest-times-of-days`}
                    render={() => (
                        <App
                            content={BusiestTimesOfDays}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/ticket-fields`}
                    render={() => (
                        <App
                            content={SupportPerformanceTicketInsights}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/tags`}
                    render={() => (
                        <App
                            content={SupportPerformanceTags}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                {!!isNewTagsReportEnabled && (
                    <Route
                        exact
                        path={`${path}/new-tags`}
                        render={() => (
                            <App content={Tags} navbar={StatsNavbarContainer} />
                        )}
                    />
                )}
                <Route
                    exact
                    path={`${path}/channels`}
                    render={() => (
                        <App
                            content={ChannelsReport}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/slas`}
                    render={() => (
                        <App
                            content={ServiceLevelAgreements}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                {!!isAutoQAEnabled && (
                    <Route
                        exact
                        path={`${path}/auto-qa`}
                        render={() => (
                            <App
                                content={withUserRoleRequired(
                                    AutoQA,
                                    AGENT_ROLE
                                )}
                                navbar={StatsNavbarContainer}
                            />
                        )}
                    />
                )}
                <Route
                    exact
                    path={`${path}/support-performance-agents`}
                    render={() => (
                        <App
                            content={SupportPerformanceAgents}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/satisfaction`}
                    render={() => (
                        <App
                            content={SupportPerformanceSatisfaction}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/revenue`}
                    render={() => (
                        <RevenueAddonApiClientProvider>
                            <App
                                content={SupportPerformanceRevenue}
                                navbar={StatsNavbarContainer}
                            />
                        </RevenueAddonApiClientProvider>
                    )}
                />
                <Route exact path={`${path}/revenue/campaigns`}>
                    <Redirect to={`${path}/convert/campaigns`} />
                </Route>
                <Route
                    exact
                    path={`${path}/convert/campaigns`}
                    render={() => (
                        <RevenueAddonApiClientProvider>
                            <App
                                content={RevenueCampaignsStats}
                                navbar={StatsNavbarContainer}
                            />
                        </RevenueAddonApiClientProvider>
                    )}
                />
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
                <Route
                    exact
                    path={`${path}/macros`}
                    render={() => (
                        <App
                            content={AutomateMacros}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/intents`}
                    render={() => (
                        <App
                            content={AutomateIntents}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/${ROUTE_AUTOMATE_OVERVIEW}`}
                    render={() => (
                        <App
                            content={AutomateStatsPaywall}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />

                {isAiAgentStatsPageEnabled && (
                    <Route
                        exact
                        path={`${path}/${ROUTE_AUTOMATE_AI_AGENT}`}
                        render={() => (
                            <App navbar={StatsNavbarContainer}>
                                <AiAgentStatsFilters>
                                    <AutomateAiAgentStats />
                                </AiAgentStatsFilters>
                            </App>
                        )}
                    />
                )}

                <Route
                    exact
                    path={`${path}/${ROUTE_OLD_PERFORMANCE_BY_FEATURES}`}
                >
                    <Redirect
                        to={`${path}/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`}
                    />
                </Route>
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
                <Route
                    exact
                    path={`${path}/help-center`}
                    render={HelpCenterStatsRoutes}
                />
                <Route
                    exact
                    path={`${path}/voice-overview`}
                    render={() => (
                        <App
                            content={VoiceOverview}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/voice-agents`}
                    render={() => (
                        <App
                            content={VoiceAgents}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
            </Switch>
        </DefaultStatsFilters>
    )
}

export function HelpCenterStatsRoutes({match: {path}}: RouteComponentProps) {
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

function AiAgentRoutes({match: {path}}: RouteComponentProps) {
    const showAutomateActions = useShowAutomateActions()
    const {shopType} = useParams<{
        shopType: string
    }>()

    const isAiAgentAIGeneratedGuidancesEnabled =
        useFlags()[FeatureFlagKey.AiAgentAIGeneratedGuidances]

    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]

    if (shopType !== 'shopify') {
        return <Redirect to="/app/automation" />
    }

    return (
        <Switch>
            <AiAgentAccountConfigurationProvider>
                <AiAgentStoreConfigurationProvider>
                    <AiAgentErrorBoundary section="ai-agent-configuration">
                        <Route
                            path={`${path}`}
                            exact
                            component={AiAgentViewContainer}
                        />
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary section="ai-agent-playground">
                        <Route
                            path={`${path}/test`}
                            exact
                            component={AiAgentPlaygroundContainer}
                        />
                    </AiAgentErrorBoundary>
                    {!!showAutomateActions && (
                        <Switch>
                            <Route
                                path={`${path}/actions`}
                                exact
                                component={ActionsViewContainer}
                            />
                            <Route
                                path={`${path}/actions/new`}
                                exact
                                component={CreateActionFormView}
                            />
                            <Route
                                path={`${path}/actions/edit/:id`}
                                exact
                                component={EditActionFormView}
                            />
                            <Route
                                path={`${path}/actions/templates`}
                                exact
                                component={ActionsTemplatesViewContainer}
                            />
                            <Route
                                path={`${path}/actions/events/:id`}
                                exact
                                component={ActionEventsViewContainer}
                            />
                        </Switch>
                    )}
                    <AiAgentErrorBoundary section="ai-agent-guidance">
                        <Route
                            path={`${path}/guidance`}
                            exact
                            component={AiAgentGuidanceContainer}
                        />
                        <Switch>
                            <Route
                                path={`${path}/guidance/new`}
                                component={AiAgentGuidanceNewContainer}
                            />
                            {isAiAgentAIGeneratedGuidancesEnabled && (
                                <Route
                                    path={`${path}/guidance/library`}
                                    exact
                                    component={AiAgentGuidanceLibraryContainer}
                                />
                            )}
                            <Route
                                path={`${path}/guidance/templates`}
                                exact
                                component={AiAgentGuidanceTemplatesContainer}
                            />
                            <Route
                                path={`${path}/guidance/templates/:templateId`}
                                component={AiAgentGuidanceTemplateNewContainer}
                            />
                            {isAiAgentAIGeneratedGuidancesEnabled && (
                                <Route
                                    path={`${path}/guidance/library/:aiGuidanceId`}
                                    component={
                                        AiAgentGuidanceAiSuggestionNewContainer
                                    }
                                />
                            )}
                            <Route
                                path={`${path}/guidance/templates`}
                                component={AiAgentGuidanceTemplatesContainer}
                            />

                            <Route
                                path={`${path}/guidance/:articleId`}
                                component={AiAgentGuidanceDetailContainer}
                            />
                        </Switch>
                    </AiAgentErrorBoundary>
                    {isAiAgentOnboardingWizardEnabled && (
                        <AiAgentErrorBoundary
                            section="ai-agent-onboarding-wizard"
                            team={OBS_ADOPT_SENTRY_TEAM}
                        >
                            <Route
                                path={`${path}/new`}
                                exact
                                component={AiAgentOnboardingWizard}
                            />
                        </AiAgentErrorBoundary>
                    )}
                </AiAgentStoreConfigurationProvider>
            </AiAgentAccountConfigurationProvider>
        </Switch>
    )
}

export function AutomationRoutes() {
    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route
                    render={() => (
                        <App
                            content={AutomationContent}
                            navbar={AutomateNavbar}
                        />
                    )}
                />
            </Switch>
        </HelpCenterApiClientProvider>
    )
}

function AutomationContent() {
    const {path} = useRouteMatch()
    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]
    const isFlowsBuilderAnalyticsEnabled =
        useFlags()[FeatureFlagKey.FlowsBuilderAnalytics]
    const isAutomateTopQuestionsEnabled =
        useFlags()[FeatureFlagKey.ObservabilityAutomateTopQuestions]
    const isNewChannelsViewEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.NewChannelsView]
    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform,
        false
    )

    return (
        <Switch>
            <Route path={`${path}/actions-platform`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformTemplatesView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/apps`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformAppsView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/apps/new`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformCreateAppFormView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/apps/edit/:id`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformEditAppFormView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/new`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformCreateTemplateView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/edit/:id`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformEditTemplateViewContainer />
                )}
            </Route>

            <Route path={`${path}/ai-recommendations`} exact>
                <SelfServiceHelpCentersProvider>
                    {isAutomateTopQuestionsEnabled && (
                        <Route
                            path={`${path}/ai-recommendations`}
                            exact
                            component={withUserRoleRequired(
                                AutomateAllRecommendationsContainer,
                                AGENT_ROLE
                            )}
                        />
                    )}
                </SelfServiceHelpCentersProvider>
            </Route>

            <Route
                path={`${path}/:shopType/:shopName/ai-agent`}
                component={withUserRoleRequired(AiAgentRoutes, AGENT_ROLE)}
            />

            <Route
                path={`${path}/:shopType/:shopName/flows/new`}
                exact
                component={withUserRoleRequired(
                    WorkflowEditorViewContainer,
                    AGENT_ROLE
                )}
            />

            {!isImprovedNavigationEnabled && (
                <Route
                    path={`${path}/:shopType/:shopName/flows/templates`}
                    exact
                    component={withUserRoleRequired(
                        WorkflowTemplatesViewContainer,
                        AGENT_ROLE
                    )}
                />
            )}

            <Route
                path={`${path}/:shopType/:shopName/flows/edit/:editWorkflowId`}
                exact
                render={(props) => (
                    <SelfServiceHelpCentersProvider>
                        <SelfServiceContactFormsProvider>
                            {React.createElement(
                                withUserRoleRequired(
                                    WorkflowEditorViewContainer,
                                    AGENT_ROLE
                                ),
                                {
                                    ...props,
                                    editWorkflowId:
                                        props.match.params.editWorkflowId,
                                    shopType: props.match.params.shopType,
                                    shopName: props.match.params.shopName,
                                }
                            )}
                        </SelfServiceContactFormsProvider>
                    </SelfServiceHelpCentersProvider>
                )}
            />

            {isFlowsBuilderAnalyticsEnabled && (
                <Route
                    path={`${path}/:shopType/:shopName/flows/analytics/:editWorkflowId`}
                    exact
                    render={(props) => (
                        <SelfServiceHelpCentersProvider>
                            <SelfServiceContactFormsProvider>
                                {React.createElement<{
                                    shopType: string
                                    shopName: string
                                    editWorkflowId: string
                                }>(
                                    withUserRoleRequired(
                                        WorkflowAnalyticsContainer,
                                        AGENT_ROLE
                                    ),
                                    {
                                        ...props,
                                        editWorkflowId:
                                            props.match.params.editWorkflowId,
                                        shopType: props.match.params.shopType,
                                        shopName: props.match.params.shopName,
                                    }
                                )}
                            </SelfServiceContactFormsProvider>
                        </SelfServiceHelpCentersProvider>
                    )}
                />
            )}

            <Route
                path={[`${path}/:shopType/:shopName/flows`]}
                render={(props) => {
                    return React.createElement(
                        withUserRoleRequired(
                            WorkflowsViewContainer,
                            AGENT_ROLE
                        ),
                        {
                            ...props,
                            shopType: props.match.params.shopType,
                            shopName: props.match.params.shopName,
                        }
                    )
                }}
            />

            <Route
                path={[
                    `${path}/shopify/:shopName/order-management`,
                    `${path}/shopify/:shopName/order-management/return`,
                    `${path}/shopify/:shopName/order-management/cancel`,
                    `${path}/shopify/:shopName/order-management/cancel`,
                    `${path}/shopify/:shopName/order-management/track`,
                    `${path}/shopify/:shopName/order-management/report-issue`,
                    `${path}/shopify/:shopName/order-management/report-issue/new`,
                    `${path}/shopify/:shopName/order-management/report-issue/:scenarioIndex`,
                ]}
                exact
            >
                <SelfServiceHelpCentersProvider>
                    <SelfServiceContactFormsProvider>
                        <OrderManagementPreviewProvider>
                            <Switch>
                                <Route
                                    path={`${path}/shopify/:shopName/order-management`}
                                    exact
                                    component={withUserRoleRequired(
                                        OrderManagementViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/return`}
                                    exact
                                    component={withUserRoleRequired(
                                        ReturnOrderFlowViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/cancel`}
                                    exact
                                    component={withUserRoleRequired(
                                        CancelOrderFlowViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue`}
                                    exact
                                    component={withUserRoleRequired(
                                        ReportOrderIssueFlowViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue/new`}
                                    exact
                                    component={withUserRoleRequired(
                                        CreateReportOrderIssueFlowScenarioViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue/:scenarioIndex`}
                                    exact
                                    component={withUserRoleRequired(
                                        EditReportOrderIssueFlowScenarioViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/track`}
                                    exact
                                    component={withUserRoleRequired(
                                        TrackOrderFlowViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                            </Switch>
                        </OrderManagementPreviewProvider>
                    </SelfServiceContactFormsProvider>
                </SelfServiceHelpCentersProvider>
            </Route>

            {!isImprovedNavigationEnabled && (
                <Route
                    path={`${path}/:shopType/:shopName/train-my-ai`}
                    exact
                    component={withUserRoleRequired(
                        TrainMyAiViewContainer,
                        AGENT_ROLE
                    )}
                />
            )}

            <Route
                path={[
                    `${path}/:shopType/:shopName/article-recommendation`,
                    `${path}/:shopType/:shopName/train-my-ai`,
                ]}
                exact={isImprovedNavigationEnabled === false ? true : false}
                render={(props) => {
                    if (
                        props.match.path ===
                            `${path}/:shopType/:shopName/train-my-ai` &&
                        isImprovedNavigationEnabled === true
                    ) {
                        return (
                            <Redirect
                                to={`${path}/${props.match.params.shopType}/${props.match.params.shopName}/article-recommendation`}
                            />
                        )
                    }
                    return React.createElement(
                        withUserRoleRequired(
                            ArticleRecommendationViewContainer,
                            AGENT_ROLE
                        ),
                        {
                            ...props,
                            shopType: props.match.params.shopType,
                            shopName: props.match.params.shopName,
                        }
                    )
                }}
            />

            <Route path={`${path}/:shopType/:shopName/connected-channels`}>
                <SelfServiceHelpCentersProvider>
                    <SelfServiceContactFormsProvider>
                        <Route
                            path={`${path}/:shopType/:shopName/connected-channels`}
                            exact={isNewChannelsViewEnabled === false}
                            component={withUserRoleRequired(
                                ConnectedChannelsViewContainer,
                                AGENT_ROLE
                            )}
                        />
                    </SelfServiceContactFormsProvider>
                </SelfServiceHelpCentersProvider>
            </Route>
            <Route path={`${path}/rules/library`} exact>
                <Redirect to={'/app/settings/rules/library'} />
            </Route>
            <Route path={`${path}`} exact>
                <AutomateLandingPageContainer />
            </Route>
            <Route>
                <Redirect to={`${path}`} />
            </Route>
        </Switch>
    )
}

export function ConvertRoutes() {
    const location = useLocation()

    useEffect(logPageChange, [location.pathname])

    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route
                    render={() => (
                        <App content={ConvertContent} navbar={ConvertNavbar} />
                    )}
                />
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}

export function ConvertContent() {
    const {path} = useRouteMatch()
    const convertPathPrefix = `${path}/${CONVERT_ROUTING_PARAM}`
    return (
        <Switch>
            <Route
                exact
                path={`${path}/setup`}
                component={withUserRoleRequired(
                    ConvertOnboardingView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup`}
                component={withUserRoleRequired(
                    ConvertOnboardingView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup/wizard`}
                component={withUserRoleRequired(
                    ConvertOnboardingWizardView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup/wizard/${CONVERT_ROUTING_TEMPLATE_PARAM}`}
                component={withUserRoleRequired(
                    CampaignTemplateCustomizeRecommendationsView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns`}
                component={withUserRoleRequired(
                    CampaignsView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/new`}
                component={withUserRoleRequired(
                    CampaignDetailsFactory as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/campaigns/library`}
                exact
                component={withUserRoleRequired(
                    CampaginLibaryView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/new/${CONVERT_ROUTING_TEMPLATE_PARAM}`}
                component={withUserRoleRequired(
                    CampaignTemplateCustomizeLibraryView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/${CONVERT_ROUTING_CAMPAIGN_PARAM}`}
                component={withUserRoleRequired(
                    CampaignDetailsFactory as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/campaigns/${CONVERT_ROUTING_CAMPAIGN_PARAM}/ab-variants`}
                component={withUserRoleRequired(
                    ABGroupIndexPage as any,
                    ADMIN_ROLE
                )}
            />
            <Route exact path={`${convertPathPrefix}/performance`}>
                <DefaultStatsFilters
                    notReadyFallback={
                        <Route
                            render={() => (
                                <App navbar={ConvertNavbar}>{null}</App>
                            )}
                        />
                    }
                >
                    <Route
                        exact
                        path={`${convertPathPrefix}/performance`}
                        component={withUserRoleRequired(
                            RevenueCampaignsStats as any,
                            ADMIN_ROLE
                        )}
                    />
                </DefaultStatsFilters>
            </Route>
            {window.USER_IMPERSONATED && (
                <Route
                    exact
                    path={`${convertPathPrefix}/ab-test-configuration`}
                    component={withUserRoleRequired(
                        UpdateABTestView as any,
                        ADMIN_ROLE
                    )}
                />
            )}
            <Route
                path={`${convertPathPrefix}/performance/subscribe`}
                exact
                component={withUserRoleRequired(
                    CampaignStatsPaywallView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/click-tracking`}
                exact
                component={withUserRoleRequired(
                    ClickTrackingSettingsView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/click-tracking/subscribe`}
                exact
                component={withUserRoleRequired(
                    ClickTrackingPaywallView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/installation`}
                exact
                component={withUserRoleRequired(
                    ConvertBundleView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/settings`}
                component={withUserRoleRequired(
                    ConvertSettingsView as any,
                    ADMIN_ROLE
                )}
            />

            <Route path={`${path}`} exact>
                <ConvertRoute />
            </Route>
            <Route>
                <Redirect to={`${path}`} />
            </Route>
        </Switch>
    )
}

export function AdminTasksRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/import-phone-number`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            ImportPhoneNumber,
                            ADMIN_ROLE,
                            PageSection.ImportPhoneNumber
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/twilio-subaccount-status`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            TwilioSubaccountStatusForm,
                            ADMIN_ROLE,
                            PageSection.TwilioSubaccountStatus
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/credit-shopify-billing-integration`}
                    exact
                    render={() => (
                        <App
                            content={withUserRoleRequired(
                                CreditShopifyBillingIntegration,
                                ADMIN_ROLE,
                                PageSection.CreditShopifyBillingIntegration
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            )}
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/create-shopify-charge`}
                    exact
                    render={() => (
                        <App
                            content={withUserRoleRequired(
                                CreateShopifyCharge,
                                ADMIN_ROLE,
                                PageSection.CreateShopifyCharge
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            )}
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/remove-shopify-billing`}
                    exact
                    render={() => (
                        <App
                            content={withUserRoleRequired(
                                RemoveShopifyBilling,
                                ADMIN_ROLE,
                                PageSection.RemoveShopifyBilling
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            )}
        </Switch>
    )
}

export function HomepageRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App navbar={TicketNavbar}>
                        <CanduContent containerId="candu-home" title="Home" />
                    </App>
                )}
            />
        </Switch>
    )
}
