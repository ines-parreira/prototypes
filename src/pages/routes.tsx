import React, {useEffect} from 'react'
import {
    Redirect,
    Route,
    RouteComponentProps,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'
import _memoize from 'lodash/memoize'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {logPageChange} from 'common/segment'
import {assetsUrl} from 'utils'
import {ADMIN_ROLE, AGENT_ROLE} from 'config/user'
import {PageSection} from 'config/pages'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import useAppSelector from 'hooks/useAppSelector'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import ClickTrackingPaywallView from 'pages/convert/clickTracking/components/ClickTrackingPaywallView/ClickTrackingPaywallView'
import App from 'pages/App'
import IntegrationDetail from 'pages/integrations/integration/Integration'
import AppDetail from 'pages/integrations/integration/components/app/App'
import IntegrationsStore from 'pages/integrations/Store'
import MyIntegrations from 'pages/integrations/Store/Mine'
import PhoneNumbersListContainer from 'pages/phoneNumbers/PhoneNumbersListContainer'
import PhoneNumberCreateContainer from 'pages/phoneNumbers/PhoneNumberCreateContainer'
import PhoneNumberDetailContainer from 'pages/phoneNumbers/PhoneNumberDetailContainer'
import ContactFormCreateView from 'pages/settings/contactForm/views/ContactFormCreateView'
import ContactFormSettingsView from 'pages/settings/contactForm/views/ContactFormSettingsView'
import ContactFormStartView from 'pages/settings/contactForm/views/ContactFormStartView'
import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_FORMS_PATH,
    CONTACT_FORM_SETTINGS_PATH,
} from 'pages/settings/contactForm/constants'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketSourceContainer from 'pages/tickets/detail/TicketSourceContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketList from 'pages/tickets/list/TicketList'
import TicketPrintContainer from 'pages/tickets/detail/TicketPrintContainer'
import CustomerListContainer from 'pages/customers/list/CustomerListContainer'
import CustomerNavbarContainer from 'pages/customers/common/CustomerNavbarContainer'
import CustomerDetailContainer from 'pages/customers/detail/CustomerDetailContainer'
import CustomerSourceContainer from 'pages/customers/detail/CustomerSourceContainer'
import CustomerInfobarContainer from 'pages/customers/detail/CustomerInfobarContainer'

import NotificationSettings from 'pages/settings/notifications/NotificationSettings'
import SidebarSettings from 'pages/settings/sidebar/SidebarSettings'
import YourProfileContainer from 'pages/settings/yourProfile/YourProfileContainer'
import PasswordAnd2FA from 'pages/settings/yourProfile/PasswordAnd2FA'
import APIView from 'pages/settings/api/APIView'

import SettingsNavbar from 'pages/settings/common/SettingsNavbar'
import StatsNavbarContainer from 'pages/stats/common/StatsNavbarContainer'
import NoMatch from 'pages/common/components/NoMatch'
import OnboardingSidePanel from 'pages/tickets/list/OnboardingSidePanel'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import NewBilling from 'pages/settings/new_billing/views/BillingStartView'
import ManageTagsContainer from 'pages/settings/tags/ManageTags'
import ImportZendeskDetail from 'pages/settings/importData/zendesk/ImportZendeskDetail'
import ImportDataContainer from 'pages/settings/importData/ImportDataContainer'
import ImportZendeskCreate from 'pages/settings/importData/zendesk/ImportZendeskCreate'
import SatisfactionSurveyView from 'pages/settings/satisfactionSurveys/SatisfactionSurveyView'
import MacrosSettingsContent from 'pages/settings/macros/MacrosSettingsContent'
import MacrosSettingsForm from 'pages/settings/macros/MacrosSettingsForm'
import RulesLibrary from 'pages/settings/rules/RulesLibrary'
import RulesView from 'pages/settings/rules/RulesList'
import RuleDetailForm from 'pages/settings/rules/accountRules/RuleDetailForm'
import Access from 'pages/settings/access/Access'
import AgentList from 'pages/settings/users/List'
import AgentDetail from 'pages/settings/users/Detail'
import TeamsList from 'pages/settings/teams/List'
import TeamsForm from 'pages/settings/teams/Form'
import List from 'pages/settings/teams/members/List'
import AutomateNavbar from 'pages/automate/common/components/AutomateNavbar'

import UserAuditList from 'pages/settings/audit/UserAuditList'
import BusinessHours from 'pages/settings/businessHours/BusinessHours'
import TicketAssignment from 'pages/settings/ticketAssignment/TicketAssignment'
import TicketFields from 'pages/settings/ticketFields/TicketFields'
import AddTicketField from 'pages/settings/ticketFields/AddTicketField'

import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import CanduContent from 'pages/onboarding/CanduContent'
import ReferralContent from 'pages/referral/ReferralContent'
import HelpCenterStartView from 'pages/settings/helpCenter/components/HelpCenterStartView'
import HelpCenterNewView from 'pages/settings/helpCenter/components/HelpCenterNewView'
import CurrentHelpCenter from 'pages/settings/helpCenter/providers/CurrentHelpCenter/CurrentHelpCenter'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {SupportedLocalesProvider} from 'pages/settings/helpCenter/providers/SupportedLocales'
import AutoMergeSettings from 'pages/settings/autoMerge/AutoMergeSettings'
import DefaultStatsFilters from 'pages/stats/DefaultStatsFilters'
import SupportPerformanceTags from 'pages/stats/SupportPerformanceTags'
import ImportPhoneNumber from 'pages/tasks/detail/ImportPhoneNumber'
import SupportPerformanceChannels from 'pages/stats/SupportPerformanceChannels'
import SupportPerformanceAgents from 'pages/stats/SupportPerformanceAgents'
import SupportPerformanceSatisfaction from 'pages/stats/SupportPerformanceSatisfaction'
import SupportPerformanceRevenue from 'pages/stats/SupportPerformanceRevenue'
import RevenueCampaignsStats from 'pages/stats/revenue/pages/CampaignsStats'
import SupportPerformanceOverview from 'pages/stats/SupportPerformanceOverview'
import DEPRECATED_SupportPerformanceOverview from 'pages/stats/DEPRECATED_SupportPerformanceOverview'
import SupportPerformanceBusiestTimesOfDays from 'pages/stats/SupportPerformanceBusiestTimesOfDays'
import LiveOverview from 'pages/stats/LiveOverview'
import LiveAgents from 'pages/stats/LiveAgents'
import AutomateMacros from 'pages/stats/AutomateMacros'
import AutomateIntents from 'pages/stats/AutomateIntents'
import SelfServiceStatsPage from 'pages/stats/self-service/SelfServiceStatsPage'
import TwilioSubaccountStatusForm from 'pages/tasks/detail/TwilioSubaccountStatusForm'
import CreditShopifyBillingIntegration from 'pages/tasks/detail/CreditShopifyBillingIntegration'
import CreateShopifyCharge from 'pages/tasks/detail/CreateShopifyCharge'
import EditTicketField from 'pages/settings/ticketFields/EditTicketField'
import {RevenueAddonApiClientProvider} from 'pages/settings/revenue/hooks/useRevenueAddonApi'
import {
    ROUTE_OLD_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_OVERVIEW,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from 'pages/stats/self-service/constants'
import CampaignStatsPaywallView from 'pages/stats/revenue/pages/CampaignsStats/CampaignStatsPaywallView'
import HelpCenterStats from 'pages/stats/help-center/pages/HelpCenterStats'
import VoiceOverview from 'pages/stats/voice/pages/VoiceOverview'
import VoiceAgents from 'pages/stats/voice/pages/VoiceAgents'
import ClickTrackingSettingsView from 'pages/convert/clickTracking/components/ClickTrackingSettingsView/ClickTrackingSettingsView'
import {Routes as SplitTicketViewRoutes} from 'split-ticket-view'
import ConvertNavbar from 'pages/convert/common/components/ConvertNavbar/ConvertNavbar'
import CampaginLibaryView from 'pages/convert/campaigns/components/CampaginLibaryView'

import {
    CONVERT_ROUTING_CAMPAIGN_PARAM,
    CONVERT_ROUTING_PARAM,
    CONVERT_ROUTING_TEMPLATE_PARAM,
} from 'pages/convert/common/constants'
import ConvertRoute from 'pages/convert/common/components/ConvertRoute/ConvertRoute'
import TicketDetailLayout from 'ticket-page/components/TicketDetailLayout'
import {CampaignsView} from 'pages/convert/campaigns/CampaignsView'
import CampaignDetailsFactory from 'pages/convert/campaigns/containers/CampaignDetailsFactory'
import {useIsConvertUiDecouplingEnabled} from './convert/common/hooks/useIsConvertUiDecouplingEnabled'
import {
    BundlesView,
    BundleInstallView,
    BundleDetailView,
} from './settings/revenue/components/BundlesView'
import OrderManagementViewContainer from './automate/orderManagement/OrderManagementViewContainer'
import ReturnOrderFlowViewContainer from './automate/orderManagement/returnOrder/ReturnOrderFlowViewContainer'
import TrackOrderFlowViewContainer from './automate/orderManagement/trackOrder/TrackOrderFlowViewContainer'
import CancelOrderFlowViewContainer from './automate/orderManagement/cancelOrder/CancelOrderFlowViewContainer'
import ReportOrderIssueFlowViewContainer from './automate/orderManagement/reportOrderIssue/ReportOrderIssueFlowViewContainer'
import CreateReportOrderIssueFlowScenarioViewContainer from './automate/orderManagement/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer'
import EditReportOrderIssueFlowScenarioViewContainer from './automate/orderManagement/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer'
import ArticleRecommendationViewContainer from './automate/articleRecommendation/ArticleRecommendationViewContainer'
import QuickResponsesViewContainer from './automate/quickResponses/QuickResponsesViewContainer'
import WorkflowsViewContainer from './automate/workflows/WorkflowsViewContainer'
import WorkflowEditorViewContainer from './automate/workflows/editor/WorkflowEditorViewContainer'
import SelfServiceHelpCentersProvider from './automate/common/providers/SelfServiceHelpCentersProvider'
import OrderManagementPreviewProvider from './automate/orderManagement/OrderManagementPreviewProvider'
import ConnectedChannelsViewContainer from './automate/connectedChannels/ConnectedChannelsViewContainer'
import WorkflowTemplatesViewContainer from './automate/workflows/WorkflowTemplatesViewContainer'
import SelfServiceContactFormsProvider from './automate/common/providers/SelfServiceContactFormsProvider'
import SupportPerformanceTicketInsights from './stats/SupportPerformanceTicketInsights'
import AutomateStatsPaywall from './stats/AutomateStatsPaywall'
import TrainMyAiViewContainer from './automate/trainMyAi/TrainMyAiViewContainer'
import AutomateRoute from './automate/common/components/AutomateRoute'
import {MigrationApiClientProvider} from './settings/helpCenter/hooks/useMigrationApi'
import HelpCenterCreationWizard from './settings/helpCenter/components/HelpCenterCreationWizard'
import ConvertOnboardingView from './convert/onboarding/components/ConvertOnboardingView'
import AiAgentViewContainer from './automate/aiAgent/AiAgentViewContainer'
import ConvertBundleView from './convert/bundles/components/ConvertBundleView'
import ConvertOnboardingRecommendationsView from './convert/onboarding/components/ConvertOnboardingRecommendationsView'
import CampaignTemplateCustomizeView from './convert/campaigns/containers/CampaignTemplateCustomizeView'

const memoizedWithUserRoleRequired = _memoize(withUserRoleRequired)

export default function Routes() {
    return (
        <Route path="/app">
            <AppRoutes />
        </Route>
    )
}

export function AppRoutes() {
    const {path} = useRouteMatch()

    const hasSplitTicketView: boolean | undefined =
        useFlags()[FeatureFlagKey.SplitTicketView]

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={TicketList}
                        navbar={TicketNavbar}
                        infobar={OnboardingSidePanel}
                    />
                )}
            />
            <Route path={`${path}/customers`} render={CustomersRoutes} />
            <Route path={`${path}/customer`} render={CustomerRoutes} />
            <Route path={`${path}/users`} render={UsersRoutes} />
            <Route path={`${path}/user`} render={UserRoutes} />
            <Route path={`${path}/ticket`} render={TicketRoutes} />
            <Route path={`${path}/tickets`} render={TicketsRoutes} />
            <Route path={`${path}/admin/tasks`} render={AdminTasksRoutes} />
            <Route path={`${path}/stats`}>
                <StatsRoutes />
            </Route>
            <Route path={`${path}/automation`} render={AutomationRoutes} />
            <Route path={`${path}/convert`} render={ConvertRoutes} />
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
            {!!hasSplitTicketView && (
                <Route path={`${path}/views`} render={SplitTicketViewRoutes} />
            )}
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
                        content={memoizedWithUserRoleRequired(
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
                        content={memoizedWithUserRoleRequired(
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
                path={`${path}/:ticketId`}
                exact
                render={TicketDetailLayout}
            />
            <Route
                path={`${path}/:ticketId/edit-widgets`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
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

export function TicketsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={TicketList}
                        navbar={TicketNavbar}
                        infobar={OnboardingSidePanel}
                    />
                )}
            />
            <Route
                path={`${path}/new/:visibility?`}
                exact
                render={() => (
                    <App
                        content={TicketList}
                        navbar={TicketNavbar}
                        infobar={OnboardingSidePanel}
                    />
                )}
            />
            <Route
                path={`${path}/search`}
                exact
                render={() => (
                    <App
                        content={TicketList}
                        navbar={TicketNavbar}
                        infobar={OnboardingSidePanel}
                    />
                )}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={() => (
                    <App
                        content={TicketList}
                        navbar={TicketNavbar}
                        infobar={OnboardingSidePanel}
                    />
                )}
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

    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const flagLoading = isAnalyticsNewCubes === undefined

    const displayVoiceAnalyticsV1: boolean | undefined =
        useFlags()[FeatureFlagKey.DisplayVoiceAnalyticsV1]

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
                    path={`${path}/support-performance-overview`}
                    render={() => (
                        <App
                            content={
                                flagLoading
                                    ? Skeleton
                                    : SupportPerformanceOverview
                            }
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/support-performance-overview-legacy`}
                    render={() => (
                        <App
                            content={DEPRECATED_SupportPerformanceOverview}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/busiest-times-of-days`}
                    render={() => (
                        <App
                            content={SupportPerformanceBusiestTimesOfDays}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/ticket-fields`}
                    render={() => (
                        <App
                            content={
                                flagLoading
                                    ? Skeleton
                                    : SupportPerformanceTicketInsights
                            }
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
                <Route
                    exact
                    path={`${path}/channels`}
                    render={() => (
                        <App
                            content={SupportPerformanceChannels}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/support-performance-agents`}
                    render={() => (
                        <App
                            content={
                                flagLoading
                                    ? Skeleton
                                    : SupportPerformanceAgents
                            }
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
                {displayVoiceAnalyticsV1 && (
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
                )}
            </Switch>
        </DefaultStatsFilters>
    )
}

export function SettingsRoutes() {
    const {path} = useRouteMatch()

    const isDecoupleContactFormEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.DecoupleContactForm]
    const satisfactionPaywallConfig = {
        [AccountFeature.SatisfactionSurveys]: {
            ...defaultPaywallConfigs[AccountFeature.SatisfactionSurveys],
            preview: assetsUrl(
                '/img/paywalls/screens/satisfaction-surveys-settings.png'
            ),
        } as PaywallConfig,
    }

    const isNavbarImprovementsEnabled: boolean =
        useFlags()[FeatureFlagKey.NavbarImprovements] || false

    const isHelpCenterCreationWizardEnabled: boolean =
        useFlags()[FeatureFlagKey.HelpCenterCreationWizard] || false

    const isConvertUiDecouplingEnabled = useIsConvertUiDecouplingEnabled()

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            IntegrationDetail,
                            ADMIN_ROLE,
                            PageSection.Channels,
                            `${path}/help-center`
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route path={`${path}/channels`} render={ChannelsSettingsRoutes} />
            <Route
                path={`${path}/integrations`}
                render={IntegrationsSettingsRoutes}
            />
            <Route
                path={`${path}/phone-numbers`}
                render={PhoneNumbersSettingsRoutes}
            />
            {/* TODO: remove the condition once the production infrastructure is setup */}
            {window.location.hostname.indexOf('gorgias.help') === -1 && (
                <Route
                    path={`${path}/help-center`}
                    render={(props) => (
                        <HelpCenterSettingsRoutes
                            isHelpCenterCreationWizardEnabled={
                                isHelpCenterCreationWizardEnabled
                            }
                            {...props}
                        />
                    )}
                />
            )}
            {!!isDecoupleContactFormEnabled && (
                <Route
                    path={`${path}/contact-form`}
                    render={ContactFormSettingsRoutes}
                />
            )}
            <Route
                path={`${path}/profile`}
                exact
                render={() => (
                    <App
                        content={YourProfileContainer}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/notifications`}
                exact
                render={() => (
                    <App
                        content={NotificationSettings}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/password-2fa`}
                exact
                render={() => (
                    <App content={PasswordAnd2FA} navbar={SettingsNavbar} />
                )}
            />
            <Route
                path={`${path}/api`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            APIView,
                            ADMIN_ROLE,
                            PageSection.Api
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/audit`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            UserAuditList,
                            ADMIN_ROLE,
                            PageSection.Audit
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route path={`${path}/teams`} render={TeamsSettingsRoutes} />
            <Route path={`${path}/users`} render={UsersSettingsRoutes} />
            {!isConvertUiDecouplingEnabled && (
                <Route
                    path={`${path}/convert`}
                    render={RevenueSettingsRoutes}
                />
            )}
            {isConvertUiDecouplingEnabled && (
                <Route
                    path={`${path}/convert`}
                    render={ConvertSettingsRedirectRoutes}
                />
            )}
            {/* TODO(@Irinel) remove this when new billing is fully released */}
            <Route path={`${path}/billing`} render={NewBillingSettingsRoutes} />
            <Route
                path={`${path}/manage-tags`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            ManageTagsContainer,
                            AGENT_ROLE,
                            PageSection.ManageTags
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route path={`${path}/import-data`} render={ImportSettingsRoutes} />
            <Route
                path={`${path}/access`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            Access,
                            ADMIN_ROLE,
                            PageSection.Access
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/satisfaction-surveys`}
                exact
                render={() => (
                    <App
                        content={withFeaturePaywall(
                            AccountFeature.SatisfactionSurveys,
                            undefined,
                            satisfactionPaywallConfig
                        )(
                            memoizedWithUserRoleRequired(
                                SatisfactionSurveyView,
                                ADMIN_ROLE,
                                PageSection.SatisfactionSurveys
                            )
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/business-hours`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            BusinessHours,
                            ADMIN_ROLE,
                            PageSection.BusinessHours
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            {isNavbarImprovementsEnabled && (
                <Route
                    path={`${path}/sidebar`}
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                SidebarSettings,
                                ADMIN_ROLE,
                                PageSection.SidebarSettings
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            )}
            <Route
                path={`${path}/ticket-fields`}
                render={() => <TicketFieldsRoutes />}
            />
            <Route path={`${path}/macros`} render={MacrosRoutes} />
            <Route path={`${path}/rules`} render={RulesRoutes} />
            <Route path={`${path}/ticket-assignment`} exact>
                <App content={TicketAssignment} navbar={SettingsNavbar} />
            </Route>
            <Route
                path={`${path}/auto-merge`}
                exact
                render={() => (
                    <App content={AutoMergeSettings} navbar={SettingsNavbar} />
                )}
            />
        </Switch>
    )
}

export function TicketFieldsRoutes() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/add`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            AddTicketField,
                            ADMIN_ROLE,
                            PageSection.TicketFields
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/:id/edit`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            EditTicketField,
                            ADMIN_ROLE,
                            PageSection.TicketFields
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route exact path={`${path}/`}>
                <Redirect to={`${path}/active`} />
            </Route>
            <Route
                path={`${path}/:activeTab`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            TicketFields,
                            ADMIN_ROLE,
                            PageSection.TicketFields
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
        </Switch>
    )
}

export function MacrosRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route path={`${path}`} exact>
                <App content={MacrosSettingsContent} navbar={SettingsNavbar} />
            </Route>
            <Route path={`${path}/new`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        MacrosSettingsForm,
                        AGENT_ROLE,
                        PageSection.SidebarSettings
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/:macroId`} exact>
                <App content={MacrosSettingsForm} navbar={SettingsNavbar} />
            </Route>
        </Switch>
    )
}

export function RulesRoutes({match: {path}}: RouteComponentProps) {
    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route path={`${path}`} exact>
                    <App content={RulesView} navbar={SettingsNavbar} />
                </Route>
                <Route path={`${path}/library`} exact>
                    <App content={RulesLibrary} navbar={SettingsNavbar} />
                </Route>
                <Route path={`${path}/new`} exact>
                    <App
                        content={memoizedWithUserRoleRequired(
                            RuleDetailForm,
                            AGENT_ROLE,
                            PageSection.SidebarSettings
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
                <Route path={`${path}/:ruleId`} exact>
                    <App content={RuleDetailForm} navbar={SettingsNavbar} />
                </Route>
            </Switch>
        </HelpCenterApiClientProvider>
    )
}

export function ChannelsSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <HelpCenterApiClientProvider>
            <RevenueAddonApiClientProvider>
                <Switch>
                    <Route
                        path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                        exact
                        render={() => (
                            <App
                                content={memoizedWithUserRoleRequired(
                                    IntegrationDetail,
                                    ADMIN_ROLE,
                                    PageSection.Channels
                                )}
                                navbar={SettingsNavbar}
                            />
                        )}
                    />
                </Switch>
            </RevenueAddonApiClientProvider>
        </HelpCenterApiClientProvider>
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

export function IntegrationsSettingsRoutes({
    match: {path},
}: RouteComponentProps) {
    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route
                    path={`${path}/`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                IntegrationsStore,
                                ADMIN_ROLE,
                                PageSection.Integrations
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
                <Route
                    path={`${path}/mine`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                MyIntegrations,
                                ADMIN_ROLE,
                                PageSection.Integrations
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
                <Route
                    path={`${path}/app/:appId/:extra?`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                AppDetail,
                                ADMIN_ROLE
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
                <Route
                    path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                IntegrationDetail,
                                ADMIN_ROLE,
                                PageSection.Integrations
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            </Switch>
        </HelpCenterApiClientProvider>
    )
}

export function PhoneNumbersSettingsRoutes({
    match: {path},
}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            PhoneNumbersListContainer,
                            ADMIN_ROLE,
                            PageSection.PhoneNumbers
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/new`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            PhoneNumberCreateContainer,
                            ADMIN_ROLE,
                            PageSection.PhoneNumbers
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/:phoneNumberId`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            PhoneNumberDetailContainer,
                            ADMIN_ROLE,
                            PageSection.PhoneNumbers
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
        </Switch>
    )
}

export function ContactFormSettingsRoutes() {
    return (
        <HelpCenterApiClientProvider>
            <SupportedLocalesProvider>
                <Switch>
                    <Route
                        exact
                        path={[
                            CONTACT_FORM_BASE_PATH,
                            CONTACT_FORM_ABOUT_PATH,
                            CONTACT_FORM_FORMS_PATH,
                        ]}
                        render={() => (
                            <App
                                content={ContactFormStartView}
                                navbar={SettingsNavbar}
                            />
                        )}
                    />
                    <Route
                        exact
                        path={CONTACT_FORM_CREATE_PATH}
                        render={() => (
                            <App
                                content={ContactFormCreateView}
                                navbar={SettingsNavbar}
                            />
                        )}
                    />
                    <Route
                        path={CONTACT_FORM_SETTINGS_PATH}
                        render={() => (
                            <App
                                content={ContactFormSettingsView}
                                navbar={SettingsNavbar}
                            />
                        )}
                    />
                </Switch>
            </SupportedLocalesProvider>
        </HelpCenterApiClientProvider>
    )
}

interface HelpCenterSettingsRoutesProps extends RouteComponentProps {
    isHelpCenterCreationWizardEnabled: boolean
}

export function HelpCenterSettingsRoutes({
    match: {path},
    isHelpCenterCreationWizardEnabled,
}: HelpCenterSettingsRoutesProps) {
    return (
        <HelpCenterApiClientProvider>
            <MigrationApiClientProvider>
                <SupportedLocalesProvider>
                    <Switch>
                        <Route
                            path={[
                                `${path}/`,
                                `${path}/about`,
                                `${path}/manage`,
                            ]}
                            exact
                            render={() => (
                                <App
                                    content={HelpCenterStartView}
                                    navbar={SettingsNavbar}
                                />
                            )}
                        />
                        <Route
                            path={`${path}/new`}
                            exact
                            render={() => (
                                <App
                                    content={
                                        isHelpCenterCreationWizardEnabled
                                            ? HelpCenterCreationWizard
                                            : HelpCenterNewView
                                    }
                                    navbar={SettingsNavbar}
                                />
                            )}
                        />
                        <Route
                            path={`${path}/:helpCenterId`}
                            render={() => (
                                <App
                                    content={CurrentHelpCenter}
                                    navbar={SettingsNavbar}
                                />
                            )}
                        />
                    </Switch>
                </SupportedLocalesProvider>
            </MigrationApiClientProvider>
        </HelpCenterApiClientProvider>
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

    const showAiAgentSettings: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentSettings]

    return (
        <Switch>
            {!!showAiAgentSettings && (
                <Route path={`${path}/:shopType/:shopName/ai-agent`}>
                    <SelfServiceHelpCentersProvider>
                        <Route
                            path={`${path}/:shopType/:shopName/ai-agent`}
                            exact
                            component={memoizedWithUserRoleRequired(
                                AiAgentViewContainer,
                                AGENT_ROLE
                            )}
                        />
                    </SelfServiceHelpCentersProvider>
                </Route>
            )}
            <Route
                path={`${path}/:shopType/:shopName/quick-responses`}
                exact
                component={memoizedWithUserRoleRequired(
                    QuickResponsesViewContainer,
                    AGENT_ROLE
                )}
            />
            <Route
                path={`${path}/:shopType/:shopName/flows`}
                exact
                component={memoizedWithUserRoleRequired(
                    WorkflowsViewContainer,
                    AGENT_ROLE
                )}
            />
            <Route
                path={`${path}/:shopType/:shopName/flows/templates`}
                exact
                component={memoizedWithUserRoleRequired(
                    WorkflowTemplatesViewContainer,
                    AGENT_ROLE
                )}
            />
            <Route
                path={[
                    `${path}/:shopType/:shopName/flows/edit/:editWorkflowId`,
                ]}
            >
                <SelfServiceHelpCentersProvider>
                    <SelfServiceContactFormsProvider>
                        <Route
                            path={`${path}/:shopType/:shopName/flows/edit/:editWorkflowId`}
                            exact
                            component={memoizedWithUserRoleRequired(
                                WorkflowEditorViewContainer,
                                AGENT_ROLE
                            )}
                        />
                    </SelfServiceContactFormsProvider>
                </SelfServiceHelpCentersProvider>
            </Route>
            <Route
                path={`${path}/:shopType/:shopName/flows/new`}
                exact
                component={memoizedWithUserRoleRequired(
                    WorkflowEditorViewContainer,
                    AGENT_ROLE
                )}
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
                                    component={memoizedWithUserRoleRequired(
                                        OrderManagementViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/return`}
                                    exact
                                    component={memoizedWithUserRoleRequired(
                                        ReturnOrderFlowViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/cancel`}
                                    exact
                                    component={memoizedWithUserRoleRequired(
                                        CancelOrderFlowViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue`}
                                    exact
                                    component={memoizedWithUserRoleRequired(
                                        ReportOrderIssueFlowViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue/new`}
                                    exact
                                    component={memoizedWithUserRoleRequired(
                                        CreateReportOrderIssueFlowScenarioViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue/:scenarioIndex`}
                                    exact
                                    component={memoizedWithUserRoleRequired(
                                        EditReportOrderIssueFlowScenarioViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/track`}
                                    exact
                                    component={memoizedWithUserRoleRequired(
                                        TrackOrderFlowViewContainer,
                                        AGENT_ROLE
                                    )}
                                />
                            </Switch>
                        </OrderManagementPreviewProvider>
                    </SelfServiceContactFormsProvider>
                </SelfServiceHelpCentersProvider>
            </Route>
            <Route
                path={`${path}/:shopType/:shopName/article-recommendation`}
                exact
                component={memoizedWithUserRoleRequired(
                    ArticleRecommendationViewContainer,
                    AGENT_ROLE
                )}
            />
            <Route
                path={`${path}/:shopType/:shopName/train-my-ai`}
                exact
                component={memoizedWithUserRoleRequired(
                    TrainMyAiViewContainer,
                    AGENT_ROLE
                )}
            />
            <Route path={`${path}/:shopType/:shopName/connected-channels`}>
                <SelfServiceHelpCentersProvider>
                    <SelfServiceContactFormsProvider>
                        <Route
                            path={`${path}/:shopType/:shopName/connected-channels`}
                            exact
                            component={memoizedWithUserRoleRequired(
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
                <AutomateRoute />
            </Route>
            <Route>
                <Redirect to={`${path}`} />
            </Route>
        </Switch>
    )
}

export function TeamsSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            TeamsList as any,
                            ADMIN_ROLE,
                            PageSection.Teams
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            TeamsForm,
                            ADMIN_ROLE,
                            PageSection.Teams
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/:id/members`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            List,
                            ADMIN_ROLE,
                            PageSection.Teams
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
        </Switch>
    )
}

export function UsersSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            AgentList as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/add`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            AgentDetail,
                            ADMIN_ROLE,
                            PageSection.Users
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            AgentDetail,
                            ADMIN_ROLE,
                            PageSection.Users
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
        </Switch>
    )
}

export function ConvertRoutes() {
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
                component={memoizedWithUserRoleRequired(
                    ConvertOnboardingView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup`}
                component={memoizedWithUserRoleRequired(
                    ConvertOnboardingView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup/recommendations`}
                component={memoizedWithUserRoleRequired(
                    ConvertOnboardingRecommendationsView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup/recommendations/${CONVERT_ROUTING_TEMPLATE_PARAM}`}
                component={memoizedWithUserRoleRequired(
                    CampaignTemplateCustomizeView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns`}
                component={memoizedWithUserRoleRequired(
                    CampaignsView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/new`}
                component={memoizedWithUserRoleRequired(
                    CampaignDetailsFactory as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/campaigns/library`}
                exact
                component={memoizedWithUserRoleRequired(
                    CampaginLibaryView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/new/${CONVERT_ROUTING_TEMPLATE_PARAM}`}
                component={memoizedWithUserRoleRequired(
                    CampaignTemplateCustomizeView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/${CONVERT_ROUTING_CAMPAIGN_PARAM}`}
                component={memoizedWithUserRoleRequired(
                    CampaignDetailsFactory as any,
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
                        component={memoizedWithUserRoleRequired(
                            RevenueCampaignsStats as any,
                            ADMIN_ROLE
                        )}
                    />
                </DefaultStatsFilters>
            </Route>
            <Route
                path={`${convertPathPrefix}/performance/subscribe`}
                exact
                component={memoizedWithUserRoleRequired(
                    CampaignStatsPaywallView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/click-tracking`}
                exact
                component={memoizedWithUserRoleRequired(
                    ClickTrackingSettingsView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/click-tracking/subscribe`}
                exact
                component={memoizedWithUserRoleRequired(
                    ClickTrackingPaywallView as any,
                    ADMIN_ROLE
                )}
            />
            <Route
                path={`${convertPathPrefix}/installation`}
                exact
                component={memoizedWithUserRoleRequired(
                    ConvertBundleView as any,
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

export function RevenueSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route
                    path={`${path}/click-tracking`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                ClickTrackingSettingsView as any,
                                ADMIN_ROLE,
                                PageSection.Users
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
                <Route
                    path={`${path}/click-tracking/subscribe`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                ClickTrackingPaywallView as any,
                                ADMIN_ROLE,
                                PageSection.Users
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
                <Route
                    path={`${path}/installations`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                BundlesView as any,
                                ADMIN_ROLE,
                                PageSection.Users
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
                <Route
                    path={`${path}/installations/new`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                BundleInstallView as any,
                                ADMIN_ROLE,
                                PageSection.Users
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
                <Route
                    path={`${path}/installations/:bundleId`}
                    exact
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                BundleDetailView as any,
                                ADMIN_ROLE,
                                PageSection.Users
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}

export function ConvertSettingsRedirectRoutes({
    match: {path},
}: RouteComponentProps) {
    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route exact path={`${path}/click-tracking`}>
                    <Redirect to={'/app/convert'} />
                </Route>
                <Route exact path={`${path}/click-tracking/subscribe`}>
                    <Redirect to={'/app/convert'} />
                </Route>
                <Route exact path={`${path}/installations`}>
                    <Redirect to={'/app/convert'} />
                </Route>
                <Route exact path={`${path}/installations/new`}>
                    <Redirect to={'/app/convert'} />
                </Route>
                <Route exact path={`${path}/installations/:bundleId`}>
                    <Redirect to={'/app/convert'} />
                </Route>
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}

// TODO(@Irinel) rename to BillingSettingsRoutes once we remove the old billing
export function NewBillingSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route
                    path={[
                        `${path}/`,
                        `${path}/payment`,
                        `${path}/payment-history`,
                    ]}
                    render={() => (
                        <App
                            content={memoizedWithUserRoleRequired(
                                NewBilling,
                                ADMIN_ROLE,
                                PageSection.NewBilling
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}

export function ImportSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            ImportDataContainer,
                            ADMIN_ROLE,
                            PageSection.ImportData
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/zendesk`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            ImportZendeskCreate,
                            ADMIN_ROLE,
                            PageSection.ImportData
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/zendesk/:integrationId/:extra?`}
                exact
                render={() => (
                    <App
                        content={memoizedWithUserRoleRequired(
                            ImportZendeskDetail,
                            ADMIN_ROLE,
                            PageSection.ImportData
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
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
                        content={memoizedWithUserRoleRequired(
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
                        content={memoizedWithUserRoleRequired(
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
                            content={memoizedWithUserRoleRequired(
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
                            content={memoizedWithUserRoleRequired(
                                CreateShopifyCharge,
                                ADMIN_ROLE,
                                PageSection.CreateShopifyCharge
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
