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
import {assetsUrl} from 'utils'
import {ADMIN_ROLE, AGENT_ROLE} from 'config/user'
import {PageSection} from 'config/pages'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import {logPageChange} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import ClickTrackingPaywallView from 'pages/settings/revenue/components/ClickTrackingPaywallView/ClickTrackingPaywallView'
import App from 'pages/App'
import IntegrationDetail from 'pages/integrations/integration/Integration'
import AppDetail from 'pages/integrations/App'
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
import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
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
import TeamList from 'pages/settings/users/List'
import TeamForm from 'pages/settings/users/Form'
import TeamsList from 'pages/settings/teams/List'
import TeamsForm from 'pages/settings/teams/Form'
import List from 'pages/settings/teams/members/List'
import AutomationNavbar from 'pages/automation/common/components/AutomationNavbar'

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
import AutomationOverview from 'pages/stats/AutomationOverview'
import AutomationMacros from 'pages/stats/AutomationMacros'
import AutomationIntents from 'pages/stats/AutomationIntents'
import SelfServiceStatsPage from 'pages/stats/self-service/SelfServiceStatsPage'
import TwilioSubaccountStatusForm from 'pages/tasks/detail/TwilioSubaccountStatusForm'
import CreditShopifyBillingIntegration from 'pages/tasks/detail/CreditShopifyBillingIntegration'
import EditTicketField from 'pages/settings/ticketFields/EditTicketField'
import {RevenueAddonApiClientProvider} from 'pages/settings/revenue/hooks/useRevenueAddonApi'
import {
    BundlesView,
    BundleInstallView,
    BundleDetailView,
} from 'pages/settings/revenue/components/BundlesView'
import OrderManagementViewContainer from 'pages/automation/orderManagement/OrderManagementViewContainer'
import ReturnOrderFlowViewContainer from 'pages/automation/orderManagement/returnOrder/ReturnOrderFlowViewContainer'
import TrackOrderFlowViewContainer from 'pages/automation/orderManagement/trackOrder/TrackOrderFlowViewContainer'
import CancelOrderFlowViewContainer from 'pages/automation/orderManagement/cancelOrder/CancelOrderFlowViewContainer'
import ReportOrderIssueFlowViewContainer from 'pages/automation/orderManagement/reportOrderIssue/ReportOrderIssueFlowViewContainer'
import CreateReportOrderIssueFlowScenarioViewContainer from 'pages/automation/orderManagement/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer'
import EditReportOrderIssueFlowScenarioViewContainer from 'pages/automation/orderManagement/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer'
import ArticleRecommendationViewContainer from 'pages/automation/articleRecommendation/ArticleRecommendationViewContainer'
import QuickResponsesViewContainer from 'pages/automation/quickResponses/QuickResponsesViewContainer'
import WorkflowsViewContainer from 'pages/automation/workflows/WorkflowsViewContainer'
import WorkflowEditorViewContainer from 'pages/automation/workflows/editor/WorkflowEditorViewContainer'
import SelfServiceHelpCentersProvider from 'pages/automation/common/providers/SelfServiceHelpCentersProvider'
import QuickResponsesPaywallView from 'pages/automation/quickResponses/QuickResponsesPaywallView'
import OrderManagementPaywallView from 'pages/automation/orderManagement/OrderManagementPaywallView'
import ArticleRecommendationPaywallView from 'pages/automation/articleRecommendation/ArticleRecommendationPaywallView'
import OrderManagementPreviewProvider from 'pages/automation/orderManagement/OrderManagementPreviewProvider'
import ConnectedChannelsViewContainer from 'pages/automation/connectedChannels/ConnectedChannelsViewContainer'
import WorkflowsPaywallView from 'pages/automation/workflows/WorkflowsPaywallView'
import WorkflowTemplatesViewContainer from 'pages/automation/workflows/WorkflowTemplatesViewContainer'
import SelfServiceContactFormsProvider from 'pages/automation/common/providers/SelfServiceContactFormsProvider'
import AutomationAddOnOverview from 'pages/stats/AutomationAddonOverview'
import SupportPerformanceTicketInsights from 'pages/stats/SupportPerformanceTicketInsights'
import {
    AUTOMATION_ADD_ON_FEATURES_PATH,
    AUTOMATION_ADD_ON_PATH,
} from 'pages/stats/self-service/constants'
import CampaignStatsPaywallView from 'pages/stats/revenue/pages/CampaignsStats/CampaignStatsPaywallView'
import HelpCenterStats from 'pages/stats/help-center/pages/HelpCenterStats'
import VoiceOverview from 'pages/stats/voice/pages/VoiceOverview'
import ClickTrackingSettingsView from 'pages/settings/revenue/components/ClickTrackingSettingsView/ClickTrackingSettingsView'

import {Routes as SplitTicketViewRoutes} from 'split-ticket-view'

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
                render={() => (
                    <App
                        content={TicketDetailContainer}
                        navbar={TicketNavbar}
                        infobar={TicketInfobarContainer}
                        infobarOnMobile={true}
                    />
                )}
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
    const isNewAutomationAddonEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.NewAutomationAddon]
    const displayVoiceAnalytics: boolean | undefined =
        useFlags()[FeatureFlagKey.DisplayVoiceAnalytics]

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
                            content={SupportPerformanceOverview}
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
                        <App
                            content={SupportPerformanceRevenue}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route exact path={`${path}/revenue/campaigns`}>
                    <Redirect to={`${path}/convert/campaigns`} />
                </Route>
                <Route
                    exact
                    path={`${path}/convert/campaigns`}
                    render={() => (
                        <App
                            content={RevenueCampaignsStats}
                            navbar={StatsNavbarContainer}
                        />
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
                    path={`${path}/automation`}
                    render={() => (
                        <App
                            content={AutomationOverview}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/macros`}
                    render={() => (
                        <App
                            content={AutomationMacros}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/intents`}
                    render={() => (
                        <App
                            content={AutomationIntents}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/${AUTOMATION_ADD_ON_PATH}`}
                    render={() => (
                        <App
                            content={
                                isNewAutomationAddonEnabled
                                    ? AutomationAddOnOverview
                                    : SelfServiceStatsPage
                            }
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/${AUTOMATION_ADD_ON_FEATURES_PATH}`}
                    render={() => (
                        <App
                            content={SelfServiceStatsPage}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/help-center`}
                    render={() => (
                        <App
                            content={HelpCenterStats}
                            navbar={StatsNavbarContainer}
                        />
                    )}
                />
                {displayVoiceAnalytics && (
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
                    render={HelpCenterSettingsRoutes}
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
            <Route path={`${path}/convert`} render={RevenueSettingsRoutes} />
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

export function ChannelsSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <HelpCenterApiClientProvider>
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

export function HelpCenterSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <HelpCenterApiClientProvider>
            <SupportedLocalesProvider>
                <Switch>
                    <Route
                        path={[`${path}/`, `${path}/about`, `${path}/manage`]}
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
                                content={HelpCenterNewView}
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
                            navbar={AutomationNavbar}
                        />
                    )}
                />
            </Switch>
        </HelpCenterApiClientProvider>
    )
}

function AutomationContent() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/macros`} exact>
                <MacrosSettingsContent />
            </Route>
            <Route
                path={`${path}/macros/new`}
                exact
                component={memoizedWithUserRoleRequired(
                    MacrosSettingsForm,
                    AGENT_ROLE,
                    PageSection.Macros
                )}
            />
            <Route path={`${path}/macros/:macroId`} exact>
                <MacrosSettingsForm />
            </Route>
            <Route path={`${path}/rules`} exact>
                <RulesView />
            </Route>
            <Route path={`${path}/rules/library`} exact>
                <RulesLibrary />
            </Route>
            <Route
                path={`${path}/rules/new`}
                exact
                component={memoizedWithUserRoleRequired(
                    RuleDetailForm,
                    AGENT_ROLE,
                    PageSection.Rules
                )}
            />
            <Route path={`${path}/rules/:ruleId`} exact>
                <RuleDetailForm />
            </Route>
            <Route path={`${path}/ticket-assignment`} exact>
                <TicketAssignment />
            </Route>
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
            <Route path={`${path}/flows`} exact>
                <WorkflowsPaywallView />
            </Route>
            <Route path={`${path}/quick-responses`} exact>
                <QuickResponsesPaywallView />
            </Route>
            <Route path={`${path}/order-management`} exact>
                <OrderManagementPaywallView />
            </Route>
            <Route path={`${path}/article-recommendation`} exact>
                <ArticleRecommendationPaywallView />
            </Route>
            <Route>
                <Redirect to="/app/automation/macros" />
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
                            TeamList as any,
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
                            TeamForm,
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
                            TeamForm,
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

// TODO(@Irinel) rename to BillingSettingsRoutes once we remove the old billing
export function NewBillingSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
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
            <Route
                path={`${path}/automation`}
                exact
                render={() => (
                    <App navbar={TicketNavbar}>
                        <CanduContent
                            containerId="candu-automation"
                            title="Automation Add-on"
                        />
                    </App>
                )}
            />
        </Switch>
    )
}
