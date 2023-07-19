import React, {ComponentType, ReactNode, useEffect} from 'react'
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
import TicketListContainer from './tickets/list/TicketListContainer'
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
import TicketFieldsStats from './stats/TicketFieldsStatsPage'
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

const memoizedWithUserRoleRequired = _memoize(withUserRoleRequired)

const appRender =
    (props: {
        navbar?: ComponentType<any>
        content?: ComponentType<any>
        infobar?: ComponentType<any>
        containerPadding?: boolean
        infobarOnMobile?: boolean
        noContainerWidthLimit?: boolean
        isEditingWidgets?: boolean
        children?: ReactNode
    }) =>
    (routeProps: RouteComponentProps) => {
        return <App {...routeProps} {...props} />
    }

export default function Routes() {
    return <Route path="/app" component={AppRoutes} />
}

export function AppRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: TicketListContainer,
                    navbar: TicketNavbar,
                    infobar: OnboardingSidePanel as any,
                })}
            />
            <Route path={`${path}/customers`} render={CustomersRoutes} />
            <Route path={`${path}/customer`} render={CustomerRoutes} />
            <Route path={`${path}/users`} render={UsersRoutes} />
            <Route path={`${path}/user`} render={UserRoutes} />
            <Route path={`${path}/ticket`} render={TicketRoutes} />
            <Route path={`${path}/tickets`} render={TicketsRoutes} />
            <Route path={`${path}/admin/tasks`} render={AdminTasksRoutes} />
            <Route
                path={`${path}/stats`}
                render={(props) => <StatsRoutes {...props} />}
            />
            <Route
                path={`${path}/automation`}
                render={() => <AutomationRoutes />}
            />
            <Route
                path={`${path}/settings`}
                render={(props) => <SettingsRoutes {...props} />}
            />
            <Route
                path={`${path}/home`}
                render={(props) => <HomepageRoutes {...props} />}
            />
            <Route
                path={`${path}/referral-program`}
                exact
                render={appRender({
                    content: ReferralContent,
                    navbar: TicketNavbar,
                })}
            />
            <Route component={NoMatch} />
        </Switch>
    )
}

export function CustomersRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: CustomerListContainer,
                    navbar: CustomerNavbarContainer,
                })}
            />
            <Route
                path={`${path}/new`}
                exact
                render={appRender({
                    content: CustomerListContainer,
                    navbar: CustomerNavbarContainer,
                })}
            />
            <Route
                path={`${path}/search`}
                exact
                render={appRender({
                    content: CustomerListContainer,
                    navbar: CustomerNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={appRender({
                    content: CustomerListContainer,
                    navbar: CustomerNavbarContainer,
                })}
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
                render={appRender({
                    content: CustomerDetailContainer,
                    navbar: CustomerNavbarContainer,
                    infobar: CustomerInfobarContainer,
                    infobarOnMobile: true,
                })}
            />
            <Route
                path={`${path}/:customerId/edit-widgets`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        CustomerSourceContainer,
                        ADMIN_ROLE,
                        undefined,
                        location.pathname.replace('/edit-widgets', '')
                    ),
                    navbar: CustomerNavbarContainer,
                    infobar: CustomerInfobarContainer,
                    isEditingWidgets: true,
                    noContainerWidthLimit: true,
                    containerPadding: true,
                })}
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
                render={appRender({
                    content: CustomerListContainer,
                    navbar: CustomerNavbarContainer,
                })}
            />
            <Route
                path={`${path}/new`}
                exact
                render={appRender({
                    content: CustomerListContainer,
                    navbar: CustomerNavbarContainer,
                })}
            />
            <Route
                path={`${path}/search`}
                exact
                render={appRender({
                    content: CustomerListContainer,
                    navbar: CustomerNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={appRender({
                    content: CustomerListContainer,
                    navbar: CustomerNavbarContainer,
                })}
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
                render={appRender({
                    content: CustomerDetailContainer,
                    navbar: CustomerNavbarContainer,
                    infobar: CustomerInfobarContainer,
                    noContainerWidthLimit: true,
                    infobarOnMobile: true,
                    containerPadding: true,
                })}
            />
            <Route
                path={`${path}/:customerId/edit-widgets`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        CustomerSourceContainer,
                        ADMIN_ROLE,
                        undefined,
                        location.pathname.replace('/edit-widgets', '')
                    ),
                    navbar: CustomerNavbarContainer,
                    infobar: CustomerInfobarContainer,
                    isEditingWidgets: true,
                    noContainerWidthLimit: true,
                    containerPadding: true,
                })}
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
                render={appRender({
                    content: TicketDetailContainer,
                    navbar: TicketNavbar,
                    infobar: TicketInfobarContainer,
                    infobarOnMobile: true,
                })}
            />
            <Route
                path={`${path}/:ticketId/edit-widgets`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        TicketSourceContainer,
                        ADMIN_ROLE,
                        undefined,
                        location.pathname.replace('/edit-widgets', '')
                    ),
                    navbar: TicketNavbar,
                    infobar: TicketInfobarContainer,
                    noContainerWidthLimit: true,
                    isEditingWidgets: true,
                    containerPadding: true,
                })}
            />
            <Route
                path={`${path}/:ticketId/print`}
                exact
                render={appRender({
                    content: TicketPrintContainer,
                })}
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
                render={appRender({
                    content: TicketListContainer,
                    navbar: TicketNavbar,
                    infobar: OnboardingSidePanel,
                })}
            />
            <Route
                path={`${path}/new/:visibility?`}
                exact
                render={appRender({
                    content: TicketListContainer,
                    navbar: TicketNavbar,
                    infobar: OnboardingSidePanel,
                })}
            />
            <Route
                path={`${path}/search`}
                exact
                render={appRender({
                    content: TicketListContainer,
                    navbar: TicketNavbar,
                    infobar: OnboardingSidePanel,
                })}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={appRender({
                    content: TicketListContainer,
                    navbar: TicketNavbar,
                    infobar: OnboardingSidePanel,
                })}
            />
        </Switch>
    )
}

export function StatsRoutes({match: {path}}: RouteComponentProps) {
    const location = useLocation()
    const hasLiveOverviewFeature = useAppSelector(
        currentAccountHasFeature(AccountFeature.OverviewLiveStatistics)
    )
    const hasAnalyticsNewAgentPerformance: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewAgentPerformance]

    useEffect(logPageChange, [location.pathname])

    return (
        <DefaultStatsFilters
            notReadyFallback={
                <Route
                    render={appRender({
                        navbar: StatsNavbarContainer,
                        children: null,
                    })}
                />
            }
        >
            <Switch>
                <Route
                    exact
                    path={`${path}/`}
                    render={() => (
                        <Redirect
                            to={`${path}/${
                                hasLiveOverviewFeature
                                    ? 'live-overview'
                                    : 'support-performance-overview'
                            }`}
                        />
                    )}
                />
                <Route
                    exact
                    path={`${path}/live-overview`}
                    render={appRender({
                        content: LiveOverview,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/live-agents`}
                    render={appRender({
                        content: LiveAgents,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/support-performance-overview`}
                    render={appRender({
                        content: SupportPerformanceOverview,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/support-performance-overview-legacy`}
                    render={appRender({
                        content: DEPRECATED_SupportPerformanceOverview,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/busiest-times-of-days`}
                    render={appRender({
                        content: SupportPerformanceBusiestTimesOfDays,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/ticket-fields`}
                    render={appRender({
                        content: TicketFieldsStats,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/tags`}
                    render={appRender({
                        content: SupportPerformanceTags,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/channels`}
                    render={appRender({
                        content: SupportPerformanceChannels,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/support-performance-agents`}
                    render={appRender({
                        content: hasAnalyticsNewAgentPerformance
                            ? SupportPerformanceAgents
                            : DEPRECATED_SupportPerformanceAgents,
                        navbar: StatsNavbarContainer,
                    })}
                />
                {hasAnalyticsNewAgentPerformance && (
                    <Route
                        exact
                        path={`${path}/support-performance-agents-legacy`}
                        render={appRender({
                            content: DEPRECATED_SupportPerformanceAgents,
                            navbar: StatsNavbarContainer,
                        })}
                    />
                )}
                <Route
                    exact
                    path={`${path}/satisfaction`}
                    render={appRender({
                        content: SupportPerformanceSatisfaction,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/revenue`}
                    render={appRender({
                        content: SupportPerformanceRevenue,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/revenue/campaigns`}
                    render={appRender({
                        content: RevenueCampaignsStats,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/automation`}
                    render={appRender({
                        content: AutomationOverview,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/macros`}
                    render={appRender({
                        content: AutomationMacros,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/intents`}
                    render={appRender({
                        content: AutomationIntents,
                        navbar: StatsNavbarContainer,
                    })}
                />
                <Route
                    exact
                    path={`${path}/automation-add-on`}
                    render={appRender({
                        content: SelfServiceStatsPage,
                        navbar: StatsNavbarContainer,
                    })}
                />
            </Switch>
        </DefaultStatsFilters>
    )
}

export function SettingsRoutes({match: {path}}: RouteComponentProps) {
    const isDecoupleContactFormEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.DecoupleContactForm]
    const isNotificationSoundsEnabled: boolean =
        useFlags()[FeatureFlagKey.NotificationSounds] || false
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
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        IntegrationDetail,
                        ADMIN_ROLE,
                        PageSection.Channels,
                        `${path}/help-center`
                    ),
                    navbar: SettingsNavbar,
                })}
            />

            <Route path={`${path}/channels`} render={ChannelsSettingsRoutes} />
            <Route
                path={`${path}/integrations`}
                render={(props) => <IntegrationsSettingsRoutes {...props} />}
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
            {isDecoupleContactFormEnabled ? (
                <Route
                    path={`${path}/contact-form`}
                    render={ContactFormSettingsRoutes}
                />
            ) : null}
            <DeprecatedRoute
                path={`${path}/macros`}
                redirectTo="/app/automation/macros"
            />
            <DeprecatedRoute
                path={`${path}/rules`}
                redirectTo="/app/automation/rules"
            />
            <Redirect from={`${path}/self-service`} to="/app/automation" />
            <Route
                path={`${path}/profile`}
                exact
                render={appRender({
                    content: YourProfileContainer,
                    navbar: SettingsNavbar,
                })}
            />
            {isNotificationSoundsEnabled && (
                <Route
                    path={`${path}/notifications`}
                    exact
                    render={appRender({
                        content: NotificationSettings,
                        navbar: SettingsNavbar,
                    })}
                />
            )}
            <Route
                path={`${path}/password-2fa`}
                exact
                render={appRender({
                    content: PasswordAnd2FA,
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/api`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        APIView,
                        ADMIN_ROLE,
                        PageSection.Api
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/audit`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        UserAuditList,
                        ADMIN_ROLE,
                        PageSection.Audit
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route path={`${path}/teams`} render={TeamsSettingsRoutes} />
            <Route path={`${path}/users`} render={UsersSettingsRoutes} />
            <Route path={`${path}/revenue`} render={RevenueSettingsRoutes} />
            {/* TODO(@Irinel) remove this when new billing is fully released */}
            <Route
                path={`${path}/billing`}
                render={
                    hasAccessToNewBilling
                        ? NewBillingSettingsRoutes
                        : BillingSettingsRoutes
                }
            />
            <Route
                path={`${path}/manage-tags`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        ManageTagsContainer,
                        AGENT_ROLE,
                        PageSection.ManageTags
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route path={`${path}/import-data`} render={ImportSettingsRoutes} />
            <Route
                path={`${path}/access`}
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        Access,
                        ADMIN_ROLE,
                        PageSection.Access
                    ),
                    navbar: SettingsNavbar,
                })}
                exact
            />
            <Route
                path={`${path}/satisfaction-surveys`}
                exact
                render={appRender({
                    content: withFeaturePaywall(
                        AccountFeature.SatisfactionSurveys,
                        undefined,
                        satisfactionPaywallConfig
                    )(
                        memoizedWithUserRoleRequired(
                            SatisfactionSurveyView,
                            ADMIN_ROLE,
                            PageSection.SatisfactionSurveys
                        )
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/business-hours`}
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        BusinessHours,
                        ADMIN_ROLE,
                        PageSection.BusinessHours
                    ),
                    navbar: SettingsNavbar,
                })}
                exact
            />
            <DeprecatedRoute
                path={`${path}/ticket-assignment`}
                exact
                redirectTo="/app/automation/ticket-assignment"
            />
            <Route path={`${path}/ticket-fields`} render={TicketFieldsRoutes} />
        </Switch>
    )
}

export function TicketFieldsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/add`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        AddTicketField,
                        ADMIN_ROLE,
                        PageSection.TicketFields
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/:id/edit`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        EditTicketField,
                        ADMIN_ROLE,
                        PageSection.TicketFields
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                exact
                path={`${path}/`}
                render={() => <Redirect to={`${path}/active`} />}
            />
            <Route
                path={`${path}/:activeTab`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        TicketFields,
                        ADMIN_ROLE,
                        PageSection.TicketFields
                    ),
                    navbar: SettingsNavbar,
                })}
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
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            IntegrationDetail,
                            ADMIN_ROLE,
                            PageSection.Channels
                        ),
                        navbar: SettingsNavbar,
                    })}
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
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            IntegrationsStore,
                            ADMIN_ROLE,
                            PageSection.Integrations
                        ),
                        navbar: SettingsNavbar,
                    })}
                />
                <Route
                    path={`${path}/mine`}
                    exact
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            MyIntegrations,
                            ADMIN_ROLE,
                            PageSection.Integrations
                        ),
                        navbar: SettingsNavbar,
                    })}
                />
                <Route
                    path={`${path}/app/:appId/:extra?`}
                    exact
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            AppDetail,
                            ADMIN_ROLE
                        ),
                        navbar: SettingsNavbar,
                    })}
                />
                <Route
                    path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                    exact
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            IntegrationDetail,
                            ADMIN_ROLE,
                            PageSection.Integrations
                        ),
                        navbar: SettingsNavbar,
                    })}
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
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        PhoneNumbersListContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/new`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        PhoneNumberCreateContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/:phoneNumberId`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        PhoneNumberDetailContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    ),
                    navbar: SettingsNavbar,
                })}
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
                        render={appRender({
                            content: ContactFormStartView,
                            navbar: SettingsNavbar,
                        })}
                    />
                    <Route
                        exact
                        path={CONTACT_FORM_CREATE_PATH}
                        render={appRender({
                            content: ContactFormCreateView,
                            navbar: SettingsNavbar,
                        })}
                    />
                    <Route
                        path={CONTACT_FORM_SETTINGS_PATH}
                        render={appRender({
                            content: ContactFormSettingsView,
                            navbar: SettingsNavbar,
                        })}
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
                        render={appRender({
                            content: HelpCenterStartView,
                            navbar: SettingsNavbar,
                        })}
                    />
                    <Route
                        path={`${path}/new`}
                        exact
                        render={appRender({
                            content: HelpCenterNewView,
                            navbar: SettingsNavbar,
                        })}
                    />
                    <Route
                        path={`${path}/:helpCenterId`}
                        render={appRender({
                            content: CurrentHelpCenter,
                            navbar: SettingsNavbar,
                        })}
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
                    render={appRender({
                        content: AutomationContent,
                        navbar: AutomationNavbar,
                    })}
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
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        TeamsList as any,
                        ADMIN_ROLE,
                        PageSection.Teams
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        TeamsForm,
                        ADMIN_ROLE,
                        PageSection.Teams
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/:id/members`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        List,
                        ADMIN_ROLE,
                        PageSection.Teams
                    ),
                    navbar: SettingsNavbar,
                })}
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
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        TeamList as any,
                        ADMIN_ROLE,
                        PageSection.Users
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/add`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        TeamForm,
                        ADMIN_ROLE,
                        PageSection.Users
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        TeamForm,
                        ADMIN_ROLE,
                        PageSection.Users
                    ),
                    navbar: SettingsNavbar,
                })}
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
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            ClickTrackingSettingsView as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        ),
                        navbar: SettingsNavbar,
                    })}
                />
                <Route
                    path={`${path}/bundles`}
                    exact
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            BundlesView as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        ),
                        navbar: SettingsNavbar,
                    })}
                />
                <Route
                    path={`${path}/bundles/new`}
                    exact
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            BundleInstallView as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        ),
                        navbar: SettingsNavbar,
                    })}
                />
                <Route
                    path={`${path}/bundles/:bundleId`}
                    exact
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            BundleDetailView as any,
                            ADMIN_ROLE,
                            PageSection.Users
                        ),
                        navbar: SettingsNavbar,
                    })}
                />
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}

export function BillingSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        BillingContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/add-payment-method`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        CreditCardContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/change-credit-card`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        CreditCardContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/update-billing-details`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        BillingDetailsFormContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/plans`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        BillingPlansContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbar,
                })}
            />
        </Switch>
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
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        NewBilling,
                        ADMIN_ROLE,
                        PageSection.NewBilling
                    ),
                    navbar: SettingsNavbar,
                })}
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
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        ImportDataContainer,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/zendesk`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        ImportZendeskCreate,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/zendesk/:integrationId/:extra?`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        ImportZendeskDetail,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    ),
                    navbar: SettingsNavbar,
                })}
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
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        ImportPhoneNumber,
                        ADMIN_ROLE,
                        PageSection.ImportPhoneNumber
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            <Route
                path={`${path}/twilio-subaccount-status`}
                exact
                render={appRender({
                    content: memoizedWithUserRoleRequired(
                        TwilioSubaccountStatusForm,
                        ADMIN_ROLE,
                        PageSection.TwilioSubaccountStatus
                    ),
                    navbar: SettingsNavbar,
                })}
            />
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/credit-shopify-billing-integration`}
                    exact
                    render={appRender({
                        content: memoizedWithUserRoleRequired(
                            CreditShopifyBillingIntegration,
                            ADMIN_ROLE,
                            PageSection.CreditShopifyBillingIntegration
                        ),
                        navbar: SettingsNavbar,
                    })}
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
                render={appRender({
                    children: (
                        <CanduContent containerId="candu-home" title="Home" />
                    ),
                    navbar: TicketNavbar,
                })}
            />
            <Route
                path={`${path}/automation`}
                exact
                render={appRender({
                    children: (
                        <CanduContent
                            containerId="candu-automation"
                            title="Automation Add-on"
                        />
                    ),
                    navbar: TicketNavbar,
                })}
            />
        </Switch>
    )
}
