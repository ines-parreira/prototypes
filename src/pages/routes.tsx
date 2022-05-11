import React, {ComponentType, ReactNode} from 'react'
import {
    Redirect,
    Route,
    RouteComponentProps,
    Switch,
    useLocation,
} from 'react-router-dom'
import {useUpdateEffect} from 'react-use'

import {ADMIN_ROLE, AGENT_ROLE} from 'config/user'
import {PageSection} from 'config/pages'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import {logPageChange} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'

import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from '../config/paywalls'
import App from './App'
import IntegrationDetail from './integrations/integration/Integration'
import AppDetail from './integrations/App'
import IntegrationsList from './integrations/List'
import PhoneNumbersListContainer from './phoneNumbers/PhoneNumbersListContainer'
import PhoneNumberCreateContainer from './phoneNumbers/PhoneNumberCreateContainer'
import PhoneNumberDetailContainer from './phoneNumbers/PhoneNumberDetailContainer'
import TicketDetailContainer from './tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from './tickets/detail/TicketInfobarContainer'
import TicketSourceContainer from './tickets/detail/TicketSourceContainer'
import TicketNavbar from './tickets/navbar/TicketNavbar'
import TicketListContainer from './tickets/list/TicketListContainer'
import SelfServiceContainer from './settings/selfService/SelfServiceContainer'
import CustomerListContainer from './customers/list/CustomerListContainer.js'
import CustomerNavbarContainer from './customers/common/CustomerNavbarContainer'
import CustomerDetailContainer from './customers/detail/CustomerDetailContainer'
import CustomerSourceContainer from './customers/detail/CustomerSourceContainer'
import CustomerInfobarContainer from './customers/detail/CustomerInfobarContainer'

import YourProfileContainer from './settings/yourProfile/YourProfileContainer'
import PasswordAnd2FA from './settings/yourProfile/PasswordAnd2FA'
import APIView from './settings/api/APIView'

import SettingsNavbarContainer from './settings/common/SettingsNavbarContainer'
import StatsNavbarContainer from './stats/common/StatsNavbarContainer'
import NoMatch from './common/components/NoMatch'
import TicketListInfobarContainer from './tickets/list/TicketListInfobarContainer'
import withUserRoleRequired from './common/utils/withUserRoleRequired'
import BillingContainer from './settings/billing/BillingContainer'
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
import RulesView from './settings/rules/RulesView'
import RuleDetailForm from './settings/rules/accountRules/RuleDetailForm'
import Access from './settings/access/index.js'
import TeamList from './settings/users/List'
import TeamForm from './settings/users/Form'
import TeamsList from './settings/teams/List'
import TeamsForm from './settings/teams/Form'
import List from './settings/teams/members/List'

import UserAuditList from './settings/audit/UserAuditList'
import BusinessHours from './settings/businessHours/BusinessHours'
import TicketAssignment from './settings/ticketAssignment/TicketAssignment'

import withFeaturePaywall from './common/utils/withFeaturePaywall'
import CanduContent from './onboarding/CanduContent'
import ReferralContent from './referral/ReferralContent'
import SelfServiceQuickResponseFlowsPreferencesContainer from './settings/selfService/components/QuickResponseFlowsPreferences'
import SelfServiceQuickResponseFlowEditItemContainer from './settings/selfService/components/QuickResponseFlowEditItem'
import SelfServiceQuickResponseFlowNewItemContainer from './settings/selfService/components/QuickResponseFlowNewItem'
import SelfServiceOrderManagementFlowsPreferencesContainer from './settings/selfService/components/OrderManagementFlowsPreferences'
import SelfServiceCancellationsPolicyContainer from './settings/selfService/components/CancellationsPolicyView'
import SelfServiceReturnsPolicyContainer from './settings/selfService/components/ReturnsPolicyView'
import SelfServiceReportIssuePolicyContainer from './settings/selfService/components/ReportIssuePolicyView/index'
import SelfServiceReportIssueCaseEditorContainer from './settings/selfService/components/ReportIssueCaseEditor/index'
import HelpCenterStartView from './settings/helpCenter/components/HelpCenterStartView'
import HelpCenterNewView from './settings/helpCenter/components/HelpCenterNewView'
import {CurrentHelpCenter} from './settings/helpCenter/providers/CurrentHelpCenter/CurrentHelpCenter'
import {HelpCenterApiClientProvider} from './settings/helpCenter/hooks/useHelpCenterApi'
import {SupportedLocalesProvider} from './settings/helpCenter/providers/SupportedLocales'
import DefaultStatsFilters from './stats/DefaultStatsFilters'
import HelpCenterPaywall from './settings/helpCenter/components/Paywalls/HelpCenterPaywall'
import SupportPerformanceTags from './stats/SupportPerformanceTags'
import ImportPhoneNumber from './tasks/detail/ImportPhoneNumber'
import SupportPerformanceChannels from './stats/SupportPerformanceChannels'
import SupportPerformanceAgents from './stats/SupportPerformanceAgents'
import SupportPerformanceSatisfaction from './stats/SupportPerformanceSatisfaction'
import SupportPerformanceRevenue from './stats/SupportPerformanceRevenue'
import SupportPerformanceOverview from './stats/SupportPerformanceOverview'
import LiveOverview from './stats/LiveOverview'
import LiveAgents from './stats/LiveAgents'
import AutomationOverview from './stats/AutomationOverview'
import AutomationMacros from './stats/AutomationMacros'
import AutomationIntents from './stats/AutomationIntents'
import SelfServiceStatsPage from './stats/self-service/SelfServiceStatsPage'
import TwilioSubaccountStatusForm from './tasks/detail/TwilioSubaccountStatusForm'

const assetsURL = window.GORGIAS_ASSETS_URL || ''

const appRender =
    (props: {
        navbar: ComponentType<any>
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
    const location = useLocation()

    useUpdateEffect(() => {
        logPageChange()
    }, [location.pathname])

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
                    infobar: TicketListInfobarContainer as any,
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
            <Route path={`${path}/settings`} render={SettingsRoutes} />
            <Route path={`${path}/home`} render={HomepageRoutes} />
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
                    content: CustomerSourceContainer,
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
                    content: CustomerSourceContainer,
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

export function TicketRoutes({match: {path}}: RouteComponentProps) {
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
                    content: TicketSourceContainer,
                    navbar: TicketNavbar,
                    infobar: TicketInfobarContainer,
                    noContainerWidthLimit: true,
                    isEditingWidgets: true,
                    containerPadding: true,
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
                    infobar: TicketListInfobarContainer,
                })}
            />
            <Route
                path={`${path}/new/:visibility?`}
                exact
                render={appRender({
                    content: TicketListContainer,
                    navbar: TicketNavbar,
                    infobar: TicketListInfobarContainer,
                })}
            />
            <Route
                path={`${path}/search`}
                exact
                render={appRender({
                    content: TicketListContainer,
                    navbar: TicketNavbar,
                    infobar: TicketListInfobarContainer,
                })}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={appRender({
                    content: TicketListContainer,
                    navbar: TicketNavbar,
                    infobar: TicketListInfobarContainer,
                })}
            />
        </Switch>
    )
}

export function StatsRoutes({match: {path}}: RouteComponentProps) {
    const hasLiveOverviewFeature = useAppSelector(
        currentAccountHasFeature(AccountFeature.OverviewLiveStatistics)
    )

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
                        content: SupportPerformanceAgents,
                        navbar: StatsNavbarContainer,
                    })}
                />
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
                    path={`${path}/self-service`}
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
    const satisfactionPaywallConfig = {
        [AccountFeature.SatisfactionSurveys]: {
            ...defaultPaywallConfigs[AccountFeature.SatisfactionSurveys],
            preview: `${assetsURL}/static/private/js/assets/img/paywalls/screens/satisfaction-surveys-settings.png`,
        } as PaywallConfig,
    }

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: YourProfileContainer,
                    navbar: SettingsNavbarContainer,
                })}
            />
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
            <Route path={`${path}/macros`} render={MacrosSettingsRoutes} />
            <Route path={`${path}/rules`} render={RulesSettingsRoute} />
            <Route
                path={`${path}/self-service`}
                render={(props) => <SelfServiceSettingsRoutes {...props} />}
            />
            <Route
                path={`${path}/profile`}
                exact
                render={appRender({
                    content: YourProfileContainer,
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/password-2fa`}
                exact
                render={appRender({
                    content: PasswordAnd2FA,
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/api`}
                exact
                render={appRender({
                    content: APIView,
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/audit`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        UserAuditList,
                        ADMIN_ROLE,
                        PageSection.Audit
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route path={`${path}/teams`} render={TeamsSettingsRoutes} />
            <Route path={`${path}/users`} render={UsersSettingsRoutes} />
            <Route path={`${path}/billing`} render={BillingSettingsRoutes} />
            <Route
                path={`${path}/manage-tags`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        ManageTagsContainer,
                        AGENT_ROLE,
                        PageSection.ManageTags
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route path={`${path}/import-data`} render={ImportSettingsRoutes} />
            <Route
                path={`${path}/access`}
                render={appRender({
                    content: withUserRoleRequired(
                        Access,
                        ADMIN_ROLE,
                        PageSection.Access
                    ),
                    navbar: SettingsNavbarContainer,
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
                        withUserRoleRequired(
                            SatisfactionSurveyView,
                            ADMIN_ROLE,
                            PageSection.SatisfactionSurveys
                        )
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/business-hours`}
                render={appRender({
                    content: withUserRoleRequired(
                        BusinessHours,
                        ADMIN_ROLE,
                        PageSection.BusinessHours
                    ),
                    navbar: SettingsNavbarContainer,
                })}
                exact
            />
            <Route
                path={`${path}/ticket-assignment`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        TicketAssignment,
                        ADMIN_ROLE,
                        PageSection.TicketAssignment
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}

export function IntegrationsSettingsRoutes({
    match: {path},
}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        IntegrationsList,
                        ADMIN_ROLE,
                        PageSection.Integrations
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/app/:appId`}
                exact
                render={appRender({
                    content: withUserRoleRequired(AppDetail, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        IntegrationDetail,
                        ADMIN_ROLE,
                        PageSection.Integrations
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
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
                    content: withUserRoleRequired(
                        PhoneNumbersListContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/new`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        PhoneNumberCreateContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:phoneNumberId`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        PhoneNumberDetailContainer,
                        ADMIN_ROLE,
                        PageSection.PhoneNumbers
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}

export function HelpCenterSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <HelpCenterApiClientProvider>
            <SupportedLocalesProvider>
                <Switch>
                    <Route
                        path={`${path}/`}
                        exact
                        render={appRender({
                            content: withFeaturePaywall(
                                AccountFeature.HelpCenter,
                                HelpCenterPaywall
                            )(
                                withUserRoleRequired(
                                    HelpCenterStartView,
                                    ADMIN_ROLE,
                                    PageSection.HelpCenter
                                )
                            ),
                            navbar: SettingsNavbarContainer,
                        })}
                    />
                    <Route
                        path={`${path}/new`}
                        exact
                        render={appRender({
                            content: withFeaturePaywall(
                                AccountFeature.HelpCenter,
                                HelpCenterPaywall
                            )(
                                withUserRoleRequired(
                                    HelpCenterNewView,
                                    ADMIN_ROLE,
                                    PageSection.HelpCenter
                                )
                            ),
                            navbar: SettingsNavbarContainer,
                        })}
                    />
                    <Route
                        path={`${path}/:helpCenterId`}
                        render={appRender({
                            content: withFeaturePaywall(
                                AccountFeature.HelpCenter,
                                HelpCenterPaywall
                            )(
                                withUserRoleRequired(
                                    CurrentHelpCenter,
                                    ADMIN_ROLE,
                                    PageSection.HelpCenter
                                )
                            ),
                            navbar: SettingsNavbarContainer,
                        })}
                    />
                </Switch>
            </SupportedLocalesProvider>
        </HelpCenterApiClientProvider>
    )
}

export function SelfServiceSettingsRoutes({
    match: {path},
}: RouteComponentProps) {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Redirect
                exact
                from={`${path}/:integrationType/:shopName/preferences`}
                to={`${path}/:integrationType/:shopName/preferences/${
                    hasAutomationAddOn ? `quick-response` : `order-management`
                }`}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences/quick-response`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceQuickResponseFlowsPreferencesContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences/quick-response/new`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceQuickResponseFlowNewItemContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences/quick-response/:quickResponseId`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceQuickResponseFlowEditItemContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences/order-management`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceOrderManagementFlowsPreferencesContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences/cancellations`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceCancellationsPolicyContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences/returns`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceReturnsPolicyContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences/report-issue`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceReportIssuePolicyContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences/report-issue/:caseIndex`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceReportIssueCaseEditorContainer,
                        ADMIN_ROLE,
                        PageSection.SelfService
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}

export function MacrosSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        MacrosSettingsContent,
                        AGENT_ROLE,
                        PageSection.Macros
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/new`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        MacrosSettingsForm,
                        AGENT_ROLE,
                        PageSection.Macros
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:macroId`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        MacrosSettingsForm,
                        AGENT_ROLE,
                        PageSection.Macros
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}

export function RulesSettingsRoute({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        RulesView,
                        AGENT_ROLE,
                        PageSection.Rules
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/new`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        RuleDetailForm,
                        AGENT_ROLE,
                        PageSection.Rules
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:ruleId`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        RuleDetailForm,
                        AGENT_ROLE,
                        PageSection.Rules
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
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
                    content: withUserRoleRequired(
                        TeamsList as any,
                        ADMIN_ROLE,
                        PageSection.Teams
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        TeamsForm,
                        ADMIN_ROLE,
                        PageSection.Teams
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id/members`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        List,
                        ADMIN_ROLE,
                        PageSection.Teams
                    ),
                    navbar: SettingsNavbarContainer,
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
                    content: withUserRoleRequired(
                        TeamList as any,
                        ADMIN_ROLE,
                        PageSection.Users
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/add`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        TeamForm,
                        ADMIN_ROLE,
                        PageSection.Users
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        TeamForm,
                        ADMIN_ROLE,
                        PageSection.Users
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}

export function BillingSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        BillingContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/add-payment-method`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        CreditCardContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/change-credit-card`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        CreditCardContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/update-billing-details`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        BillingDetailsFormContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/plans`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        BillingPlansContainer,
                        ADMIN_ROLE,
                        PageSection.Billing
                    ),
                    navbar: SettingsNavbarContainer,
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
                    content: withUserRoleRequired(
                        ImportDataContainer,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/zendesk`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        ImportZendeskCreate,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/zendesk/:integrationId/:extra?`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        ImportZendeskDetail,
                        ADMIN_ROLE,
                        PageSection.ImportData
                    ),
                    navbar: SettingsNavbarContainer,
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
                    content: withUserRoleRequired(
                        ImportPhoneNumber,
                        ADMIN_ROLE,
                        PageSection.ImportPhoneNumber
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/twilio-subaccount-status`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        TwilioSubaccountStatusForm,
                        ADMIN_ROLE,
                        PageSection.TwilioSubaccountStatus
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
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
