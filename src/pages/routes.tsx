import React, {useEffect} from 'react'
import {
    Redirect,
    Route,
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

import {Routes as SplitTicketViewRoutes} from 'split-ticket-view'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from '../config/paywalls'
import App from './App'
import IntegrationDetail from './integrations/integration/Integration'
import AppDetail from './integrations/App'
import IntegrationsStore from './integrations/Store'
import MyIntegrations from './integrations/Store/Mine'
import PhoneNumbersListContainer from './phoneNumbers/PhoneNumbersListContainer'
import PhoneNumberCreateContainer from './phoneNumbers/PhoneNumberCreateContainer'
import PhoneNumberDetailContainer from './phoneNumbers/PhoneNumberDetailContainer'
import ContactFormCreateView from './settings/contactForm/views/ContactFormCreateView'
import ContactFormSettingsView from './settings/contactForm/views/ContactFormSettingsView'
import ContactFormStartView from './settings/contactForm/views/ContactFormStartView'
import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_FORMS_PATH,
    CONTACT_FORM_SETTINGS_PATH,
} from './settings/contactForm/constants'
import TicketDetailContainer from './tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from './tickets/detail/TicketInfobarContainer'
import TicketSourceContainer from './tickets/detail/TicketSourceContainer'
import TicketNavbar from './tickets/navbar/TicketNavbar'
import TicketList from './tickets/list/TicketList'
import TicketPrintContainer from './tickets/detail/TicketPrintContainer'
import CustomerListContainer from './customers/list/CustomerListContainer'
import CustomerNavbarContainer from './customers/common/CustomerNavbarContainer'
import CustomerDetailContainer from './customers/detail/CustomerDetailContainer'
import CustomerSourceContainer from './customers/detail/CustomerSourceContainer'
import CustomerInfobarContainer from './customers/detail/CustomerInfobarContainer'

import NotificationSettings from './settings/notifications/NotificationSettings'
import YourProfileContainer from './settings/yourProfile/YourProfileContainer'
import PasswordAnd2FA from './settings/yourProfile/PasswordAnd2FA'
import APIView from './settings/api/APIView'

import SettingsNavbar from './settings/common/SettingsNavbar'
import StatsNavbarContainer from './stats/common/StatsNavbarContainer'
import NoMatch from './common/components/NoMatch'
import OnboardingSidePanel from './tickets/list/OnboardingSidePanel'
import withUserRoleRequired from './common/utils/withUserRoleRequired'
import BillingContainer from './settings/billing/BillingContainer'
import NewBilling from './settings/new_billing/views/BillingStartView'
import CreditCardContainer from './settings/billing/credit-cards/CreditCard'
import BillingDetailsFormContainer from './settings/billing/details/BillingDetailsForm'
import BillingPlansContainer from './settings/billing/plans/BillingPlans'
import ManageTagsContainer from './settings/tags/ManageTags'
import ImportZendeskDetail from './settings/importData/zendesk/ImportZendeskDetail'
import ImportDataContainer from './settings/importData/ImportDataContainer'
import ImportZendeskCreate from './settings/importData/zendesk/ImportZendeskCreate'
import SatisfactionSurveyView from './settings/satisfactionSurveys/SatisfactionSurveyView'
import MacrosSettingsContent from './settings/macros/MacrosSettingsContent'
import MacrosSettingsForm from './settings/macros/MacrosSettingsForm'
import RulesLibrary from './settings/rules/RulesLibrary'
import RulesView from './settings/rules/RulesList'
import RuleDetailForm from './settings/rules/accountRules/RuleDetailForm'
import Access from './settings/access/Access'
import TeamList from './settings/users/List'
import TeamForm from './settings/users/Form'
import TeamsList from './settings/teams/List'
import TeamsForm from './settings/teams/Form'
import List from './settings/teams/members/List'
import AutomationNavbar from './automation/common/components/AutomationNavbar'

import UserAuditList from './settings/audit/UserAuditList'
import BusinessHours from './settings/businessHours/BusinessHours'
import TicketAssignment from './settings/ticketAssignment/TicketAssignment'
import TicketFields from './settings/ticketFields/TicketFields'
import AddTicketField from './settings/ticketFields/AddTicketField'

import withFeaturePaywall from './common/utils/withFeaturePaywall'
import CanduContent from './onboarding/CanduContent'
import ReferralContent from './referral/ReferralContent'
import HelpCenterStartView from './settings/helpCenter/components/HelpCenterStartView'
import HelpCenterNewView from './settings/helpCenter/components/HelpCenterNewView'
import CurrentHelpCenter from './settings/helpCenter/providers/CurrentHelpCenter/CurrentHelpCenter'
import {HelpCenterApiClientProvider} from './settings/helpCenter/hooks/useHelpCenterApi'
import {SupportedLocalesProvider} from './settings/helpCenter/providers/SupportedLocales'
import DefaultStatsFilters from './stats/DefaultStatsFilters'
import TicketFieldsStatsPagePlaceholder from './stats/TicketFieldsStatsPagePlaceholder'
import SupportPerformanceTags from './stats/SupportPerformanceTags'
import ImportPhoneNumber from './tasks/detail/ImportPhoneNumber'
import SupportPerformanceChannels from './stats/SupportPerformanceChannels'
import SupportPerformanceAgents from './stats/SupportPerformanceAgents'
import SupportPerformanceSatisfaction from './stats/SupportPerformanceSatisfaction'
import SupportPerformanceRevenue from './stats/SupportPerformanceRevenue'
import RevenueCampaignsStats from './stats/revenue/pages/CampaignsStats'
import SupportPerformanceOverview from './stats/SupportPerformanceOverview'
import DEPRECATED_SupportPerformanceAgents from './stats/DEPRECATED_SupportPerformanceAgents'
import DEPRECATED_SupportPerformanceOverview from './stats/DEPRECATED_SupportPerformanceOverview'
import SupportPerformanceBusiestTimesOfDays from './stats/SupportPerformanceBusiestTimesOfDays'
import LiveOverview from './stats/LiveOverview'
import LiveAgents from './stats/LiveAgents'
import AutomationOverview from './stats/AutomationOverview'
import AutomationMacros from './stats/AutomationMacros'
import AutomationIntents from './stats/AutomationIntents'
import SelfServiceStatsPage from './stats/self-service/SelfServiceStatsPage'
import TwilioSubaccountStatusForm from './tasks/detail/TwilioSubaccountStatusForm'
import CreditShopifyBillingIntegration from './tasks/detail/CreditShopifyBillingIntegration'
import EditTicketField from './settings/ticketFields/EditTicketField'
import DeprecatedRoute from './common/components/DeprecatedRoute'
import {RevenueAddonApiClientProvider} from './settings/revenue/hooks/useRevenueAddonApi'
import {
    BundlesView,
    BundleInstallView,
    BundleDetailView,
} from './settings/revenue/components/BundlesView'
import {ClickTrackingSettingsView} from './settings/revenue/components/ClickTrackingSettingsView'
import OrderManagementViewContainer from './automation/orderManagement/OrderManagementViewContainer'
import ReturnOrderFlowViewContainer from './automation/orderManagement/returnOrder/ReturnOrderFlowViewContainer'
import TrackOrderFlowViewContainer from './automation/orderManagement/trackOrder/TrackOrderFlowViewContainer'
import CancelOrderFlowViewContainer from './automation/orderManagement/cancelOrder/CancelOrderFlowViewContainer'
import ReportOrderIssueFlowViewContainer from './automation/orderManagement/reportOrderIssue/ReportOrderIssueFlowViewContainer'
import CreateReportOrderIssueFlowScenarioViewContainer from './automation/orderManagement/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer'
import EditReportOrderIssueFlowScenarioViewContainer from './automation/orderManagement/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer'
import ArticleRecommendationViewContainer from './automation/articleRecommendation/ArticleRecommendationViewContainer'
import QuickResponsesViewContainer from './automation/quickResponses/QuickResponsesViewContainer'
import WorkflowsViewContainer from './automation/workflows/WorkflowsViewContainer'
import WorkflowEditorViewContainer from './automation/workflows/editor/WorkflowEditorViewContainer'
import SelfServiceHelpCentersProvider from './automation/common/providers/SelfServiceHelpCentersProvider'
import QuickResponsesPaywallView from './automation/quickResponses/QuickResponsesPaywallView'
import OrderManagementPaywallView from './automation/orderManagement/OrderManagementPaywallView'
import ArticleRecommendationPaywallView from './automation/articleRecommendation/ArticleRecommendationPaywallView'
import OrderManagementPreviewProvider from './automation/orderManagement/OrderManagementPreviewProvider'
import ConnectedChannelsViewContainer from './automation/connectedChannels/ConnectedChannelsViewContainer'
import WorkflowsPaywallView from './automation/workflows/WorkflowsPaywallView'
import WorkflowTemplatesViewContainer from './automation/workflows/WorkflowTemplatesViewContainer'
import SelfServiceContactFormsProvider from './automation/common/providers/SelfServiceContactFormsProvider'
import AutomationAddOnOverview from './stats/AutomationAddonOverview'
import SupportPerformanceTicketInsights from './stats/SupportPerformanceTicketInsights'
import {
    AUTOMATION_ADD_ON_FEATURES_PATH,
    AUTOMATION_ADD_ON_PATH,
} from './stats/self-service/constants'

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
            <Route path={`${path}/`} exact>
                <App
                    content={TicketList}
                    navbar={TicketNavbar}
                    infobar={OnboardingSidePanel}
                />
            </Route>
            <Route path={`${path}/customers`}>
                <CustomersRoutes />
            </Route>
            <Route path={`${path}/customer`}>
                <CustomerRoutes />
            </Route>
            <Route path={`${path}/users`}>
                <UsersRoutes />
            </Route>
            <Route path={`${path}/user`}>
                <UserRoutes />
            </Route>
            <Route path={`${path}/ticket`}>
                <TicketRoutes />
            </Route>
            <Route path={`${path}/tickets`}>
                <TicketsRoutes />
            </Route>
            <Route path={`${path}/admin/tasks`}>
                <AdminTasksRoutes />
            </Route>
            <Route path={`${path}/stats`}>
                <StatsRoutes />
            </Route>
            <Route path={`${path}/automation`}>
                <AutomationRoutes />
            </Route>
            <Route path={`${path}/settings`}>
                <SettingsRoutes />
            </Route>
            <Route path={`${path}/home`}>
                <HomepageRoutes />
            </Route>
            <Route path={`${path}/referral-program`} exact>
                <App content={ReferralContent} navbar={TicketNavbar} />
            </Route>
            {!!hasSplitTicketView && (
                <Route path={`${path}/views`}>
                    <SplitTicketViewRoutes />
                </Route>
            )}
            <Route>
                <NoMatch />
            </Route>
        </Switch>
    )
}

export function CustomersRoutes() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={CustomerListContainer}
                    navbar={CustomerNavbarContainer}
                />
            </Route>
            <Route path={`${path}/new`} exact>
                <App
                    content={CustomerListContainer}
                    navbar={CustomerNavbarContainer}
                />
            </Route>
            <Route path={`${path}/search`} exact>
                <App
                    content={CustomerListContainer}
                    navbar={CustomerNavbarContainer}
                />
            </Route>
            <Route path={`${path}/:viewId/:viewSlug?`} exact>
                <App
                    content={CustomerListContainer}
                    navbar={CustomerNavbarContainer}
                />
            </Route>
        </Switch>
    )
}

export function CustomerRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/:customerId`} exact>
                <App
                    content={CustomerDetailContainer}
                    navbar={CustomerNavbarContainer}
                    infobar={CustomerInfobarContainer}
                    infobarOnMobile
                />
            </Route>
            <Route path={`${path}/:customerId/edit-widgets`} exact>
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
            </Route>
        </Switch>
    )
}

export function UsersRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={CustomerListContainer}
                    navbar={CustomerNavbarContainer}
                />
            </Route>
            <Route path={`${path}/new`} exact>
                <App
                    content={CustomerListContainer}
                    navbar={CustomerNavbarContainer}
                />
            </Route>
            <Route path={`${path}/search`} exact>
                <App
                    content={CustomerListContainer}
                    navbar={CustomerNavbarContainer}
                />
            </Route>
            <Route path={`${path}/:viewId/:viewSlug?`} exact>
                <App
                    content={CustomerListContainer}
                    navbar={CustomerNavbarContainer}
                />
            </Route>
        </Switch>
    )
}

export function UserRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/:customerId`} exact>
                <App
                    content={CustomerDetailContainer}
                    navbar={CustomerNavbarContainer}
                    infobar={CustomerInfobarContainer}
                    noContainerWidthLimit
                    infobarOnMobile
                    containerPadding
                />
            </Route>
            <Route path={`${path}/:customerId/edit-widgets`} exact>
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
            </Route>
        </Switch>
    )
}

export function TicketRoutes() {
    const location = useLocation()
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/:ticketId`} exact>
                <App
                    content={TicketDetailContainer}
                    navbar={TicketNavbar}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            </Route>
            <Route path={`${path}/:ticketId/edit-widgets`} exact>
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
            </Route>
            <Route path={`${path}/:ticketId/print`} exact>
                <App content={TicketPrintContainer} />
            </Route>
        </Switch>
    )
}

export function TicketsRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={TicketList}
                    navbar={TicketNavbar}
                    infobar={OnboardingSidePanel}
                />
            </Route>
            <Route path={`${path}/new/:visibility?`} exact>
                <App
                    content={TicketList}
                    navbar={TicketNavbar}
                    infobar={OnboardingSidePanel}
                />
            </Route>
            <Route path={`${path}/search`} exact>
                <App
                    content={TicketList}
                    navbar={TicketNavbar}
                    infobar={OnboardingSidePanel}
                />
            </Route>
            <Route path={`${path}/:viewId/:viewSlug?`} exact>
                <App
                    content={TicketList}
                    navbar={TicketNavbar}
                    infobar={OnboardingSidePanel}
                />
            </Route>
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
    const hasAnalyticsTicketInsights: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsTicketInsights]

    useEffect(logPageChange, [location.pathname])

    return (
        <DefaultStatsFilters
            notReadyFallback={
                <Route>
                    <App navbar={StatsNavbarContainer} />
                </Route>
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
                <Route exact path={`${path}/live-overview`}>
                    <App content={LiveOverview} navbar={StatsNavbarContainer} />
                </Route>
                <Route exact path={`${path}/live-agents`}>
                    <App content={LiveAgents} navbar={StatsNavbarContainer} />
                </Route>
                <Route exact path={`${path}/support-performance-overview`}>
                    <App
                        content={SupportPerformanceOverview}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route
                    exact
                    path={`${path}/support-performance-overview-legacy`}
                >
                    <App
                        content={DEPRECATED_SupportPerformanceOverview}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/busiest-times-of-days`}>
                    <App
                        content={SupportPerformanceBusiestTimesOfDays}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                {hasAnalyticsTicketInsights ? (
                    <Route exact path={`${path}/ticket-insights`}>
                        <App
                            content={SupportPerformanceTicketInsights}
                            navbar={StatsNavbarContainer}
                        />
                    </Route>
                ) : (
                    <Route exact path={`${path}/ticket-fields`}>
                        <App
                            content={TicketFieldsStatsPagePlaceholder}
                            navbar={StatsNavbarContainer}
                        />
                    </Route>
                )}
                <Route exact path={`${path}/tags`}>
                    <App
                        content={SupportPerformanceTags}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/channels`}>
                    <App
                        content={SupportPerformanceChannels}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/support-performance-agents`}>
                    <App
                        content={SupportPerformanceAgents}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/support-performance-agents-legacy`}>
                    <App
                        content={DEPRECATED_SupportPerformanceAgents}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/satisfaction`}>
                    <App
                        content={SupportPerformanceSatisfaction}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/revenue`}>
                    <App
                        content={SupportPerformanceRevenue}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/revenue/campaigns`}>
                    <App
                        content={RevenueCampaignsStats}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/automation`}>
                    <App
                        content={AutomationOverview}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/macros`}>
                    <App
                        content={AutomationMacros}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/intents`}>
                    <App
                        content={AutomationIntents}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route exact path={`${path}/${AUTOMATION_ADD_ON_PATH}`}>
                    <App
                        content={
                            isNewAutomationAddonEnabled
                                ? AutomationAddOnOverview
                                : SelfServiceStatsPage
                        }
                        navbar={StatsNavbarContainer}
                    />
                </Route>
                <Route
                    exact
                    path={`${path}/${AUTOMATION_ADD_ON_FEATURES_PATH}`}
                >
                    <App
                        content={SelfServiceStatsPage}
                        navbar={StatsNavbarContainer}
                    />
                </Route>
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
    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        IntegrationDetail,
                        ADMIN_ROLE,
                        PageSection.Channels,
                        `${path}/help-center`
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>

            <Route path={`${path}/channels`}>
                <ChannelsSettingsRoutes />
            </Route>
            <Route path={`${path}/integrations`}>
                <IntegrationsSettingsRoutes />
            </Route>
            <Route path={`${path}/phone-numbers`}>
                <PhoneNumbersSettingsRoutes />
            </Route>
            {/* TODO: remove the condition once the production infrastructure is setup */}
            {window.location.hostname.indexOf('gorgias.help') === -1 && (
                <Route path={`${path}/help-center`}>
                    <HelpCenterSettingsRoutes />
                </Route>
            )}
            {!!isDecoupleContactFormEnabled && (
                <Route path={`${path}/contact-form`}>
                    <ContactFormSettingsRoutes />
                </Route>
            )}
            <DeprecatedRoute
                path={`${path}/macros`}
                redirectTo="/app/automation/macros"
            />
            <DeprecatedRoute
                path={`${path}/rules`}
                redirectTo="/app/automation/rules"
            />
            <Route path={`${path}/self-service`}>
                <Redirect to="/app/automation" />
            </Route>
            <Route path={`${path}/profile`} exact>
                <App content={YourProfileContainer} navbar={SettingsNavbar} />
            </Route>
            <Route path={`${path}/notifications`} exact>
                <App content={NotificationSettings} navbar={SettingsNavbar} />
            </Route>
            <Route path={`${path}/password-2fa`} exact>
                <App content={PasswordAnd2FA} navbar={SettingsNavbar} />
            </Route>
            <Route path={`${path}/api`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        APIView,
                        ADMIN_ROLE,
                        PageSection.Api
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/audit`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        UserAuditList,
                        ADMIN_ROLE,
                        PageSection.Audit
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/teams`}>
                <TeamsSettingsRoutes />
            </Route>
            <Route path={`${path}/users`}>
                <UsersSettingsRoutes />
            </Route>
            <Route path={`${path}/revenue`}>
                <RevenueSettingsRoutes />
            </Route>
            {/* TODO(@Irinel) remove this when new billing is fully released */}
            <Route path={`${path}/billing`}>
                {hasAccessToNewBilling ? (
                    <NewBillingSettingsRoutes />
                ) : (
                    <BillingSettingsRoutes />
                )}
            </Route>
            <Route path={`${path}/manage-tags`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        ManageTagsContainer,
                        AGENT_ROLE,
                        PageSection.ManageTags
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/import-data`}>
                <ImportSettingsRoutes />
            </Route>
            <Route path={`${path}/access`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        Access,
                        ADMIN_ROLE,
                        PageSection.Access
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/satisfaction-surveys`} exact>
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
            </Route>
            <Route path={`${path}/business-hours`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        BusinessHours,
                        ADMIN_ROLE,
                        PageSection.BusinessHours
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <DeprecatedRoute
                path={`${path}/ticket-assignment`}
                exact
                redirectTo="/app/automation/ticket-assignment"
            />
            <Route path={`${path}/ticket-fields`}>
                <TicketFieldsRoutes />
            </Route>
        </Switch>
    )
}

export function TicketFieldsRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/add`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        AddTicketField,
                        ADMIN_ROLE,
                        PageSection.TicketFields
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/:id/edit`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        EditTicketField,
                        ADMIN_ROLE,
                        PageSection.TicketFields
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route exact path={`${path}/`}>
                <Redirect to={`${path}/active`} />
            </Route>
            <Route path={`${path}/:activeTab`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        TicketFields,
                        ADMIN_ROLE,
                        PageSection.TicketFields
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
        </Switch>
    )
}

export function ChannelsSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route
                    path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                    exact
                >
                    <App
                        content={memoizedWithUserRoleRequired(
                            IntegrationDetail,
                            ADMIN_ROLE,
                            PageSection.Channels
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
            </Switch>
        </HelpCenterApiClientProvider>
    )
}

export function IntegrationsSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route path={`${path}/`} exact>
                    <App
                        content={memoizedWithUserRoleRequired(
                            IntegrationsStore,
                            ADMIN_ROLE,
                            PageSection.Integrations
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
                <Route path={`${path}/mine`} exact>
                    <App
                        content={memoizedWithUserRoleRequired(
                            MyIntegrations,
                            ADMIN_ROLE,
                            PageSection.Integrations
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
                <Route path={`${path}/app/:appId/:extra?`} exact>
                    <App
                        content={memoizedWithUserRoleRequired(
                            AppDetail,
                            ADMIN_ROLE
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
                <Route
                    path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                    exact
                >
                    <App
                        content={memoizedWithUserRoleRequired(
                            IntegrationDetail,
                            ADMIN_ROLE,
                            PageSection.Integrations
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
            </Switch>
        </HelpCenterApiClientProvider>
    )
}

export function PhoneNumbersSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        PhoneNumbersListContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/new`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        PhoneNumberCreateContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/:phoneNumberId`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        PhoneNumberDetailContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
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
                    >
                        <App
                            content={ContactFormStartView}
                            navbar={SettingsNavbar}
                        />
                    </Route>
                    <Route exact path={CONTACT_FORM_CREATE_PATH}>
                        <App
                            content={ContactFormCreateView}
                            navbar={SettingsNavbar}
                        />
                    </Route>
                    <Route path={CONTACT_FORM_SETTINGS_PATH}>
                        <App
                            content={ContactFormSettingsView}
                            navbar={SettingsNavbar}
                        />
                    </Route>
                </Switch>
            </SupportedLocalesProvider>
        </HelpCenterApiClientProvider>
    )
}

export function HelpCenterSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <HelpCenterApiClientProvider>
            <SupportedLocalesProvider>
                <Switch>
                    <Route
                        path={[`${path}/`, `${path}/about`, `${path}/manage`]}
                        exact
                    >
                        <App
                            content={HelpCenterStartView}
                            navbar={SettingsNavbar}
                        />
                    </Route>
                    <Route path={`${path}/new`} exact>
                        <App
                            content={HelpCenterNewView}
                            navbar={SettingsNavbar}
                        />
                    </Route>
                    <Route path={`${path}/:helpCenterId`}>
                        <App
                            content={CurrentHelpCenter}
                            navbar={SettingsNavbar}
                        />
                    </Route>
                </Switch>
            </SupportedLocalesProvider>
        </HelpCenterApiClientProvider>
    )
}

export function AutomationRoutes() {
    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route>
                    <App
                        content={AutomationContent}
                        navbar={AutomationNavbar}
                    />
                </Route>
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

export function TeamsSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        TeamsList as any,
                        ADMIN_ROLE,
                        PageSection.Teams
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/:id`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        TeamsForm,
                        ADMIN_ROLE,
                        PageSection.Teams
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/:id/members`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        List,
                        ADMIN_ROLE,
                        PageSection.Teams
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
        </Switch>
    )
}

export function UsersSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        TeamList as any,
                        ADMIN_ROLE,
                        PageSection.Users
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/add`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        TeamForm,
                        ADMIN_ROLE,
                        PageSection.Users
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/:id`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        TeamForm,
                        ADMIN_ROLE,
                        PageSection.Users
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
        </Switch>
    )
}

export function RevenueSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route path={`${path}/click-tracking`} exact>
                    <App
                        content={memoizedWithUserRoleRequired(
                            ClickTrackingSettingsView as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
                <Route path={`${path}/bundles`} exact>
                    <App
                        content={memoizedWithUserRoleRequired(
                            BundlesView as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
                <Route path={`${path}/bundles/new`} exact>
                    <App
                        content={memoizedWithUserRoleRequired(
                            BundleInstallView as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
                <Route path={`${path}/bundles/:bundleId`} exact>
                    <App
                        content={memoizedWithUserRoleRequired(
                            BundleDetailView as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}

export function BillingSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        BillingContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/add-payment-method`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        CreditCardContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/change-credit-card`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        CreditCardContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/update-billing-details`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        BillingDetailsFormContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/plans`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        BillingPlansContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
        </Switch>
    )
}

// TODO(@Irinel) rename to BillingSettingsRoutes once we remove the old billing
export function NewBillingSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route
                path={[
                    `${path}/`,
                    `${path}/payment`,
                    `${path}/payment-history`,
                ]}
            >
                <App
                    content={memoizedWithUserRoleRequired(
                        NewBilling,
                        ADMIN_ROLE,
                        PageSection.NewBilling
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
        </Switch>
    )
}

export function ImportSettingsRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        ImportDataContainer,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/zendesk`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        ImportZendeskCreate,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/zendesk/:integrationId/:extra?`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        ImportZendeskDetail,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
        </Switch>
    )
}

export function AdminTasksRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/import-phone-number`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        ImportPhoneNumber,
                        ADMIN_ROLE,
                        PageSection.ImportPhoneNumber
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            <Route path={`${path}/twilio-subaccount-status`} exact>
                <App
                    content={memoizedWithUserRoleRequired(
                        TwilioSubaccountStatusForm,
                        ADMIN_ROLE,
                        PageSection.TwilioSubaccountStatus
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/credit-shopify-billing-integration`}
                    exact
                >
                    <App
                        content={memoizedWithUserRoleRequired(
                            CreditShopifyBillingIntegration,
                            ADMIN_ROLE,
                            PageSection.CreditShopifyBillingIntegration
                        )}
                        navbar={SettingsNavbar}
                    />
                </Route>
            )}
        </Switch>
    )
}

export function HomepageRoutes() {
    const {path} = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <App navbar={TicketNavbar}>
                    <CanduContent containerId="candu-home" title="Home" />
                </App>
            </Route>
            <Route path={`${path}/automation`} exact>
                <App navbar={TicketNavbar}>
                    <CanduContent
                        containerId="candu-automation"
                        title="Automation Add-on"
                    />
                </App>
            </Route>
        </Switch>
    )
}
