import React, {ComponentType} from 'react'
import {Route, Switch, Redirect, RouteComponentProps} from 'react-router-dom'
import {useSelector} from 'react-redux'

import {ADMIN_ROLE, AGENT_ROLE} from '../config/user'
import {currentAccountHasFeature} from '../state/currentAccount/selectors'
import {AccountFeature} from '../state/currentAccount/types'

import App from './App'
import IntegrationDetailContainer from './integrations/detail/IntegrationDetailContainer'
import IntegrationListContainer from './integrations/list/IntegrationListContainer'
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
import DEPRECATED_StatsPage from './stats/DEPRECATED_StatsPage'

import YourProfileContainer from './settings/yourProfile/YourProfileContainer.js'
import ChangePassword from './settings/yourProfile/ChangePassword'
import APIView from './settings/api/APIView'

import SettingsNavbarContainer from './settings/common/SettingsNavbarContainer'
import StatsNavbarContainer from './stats/common/StatsNavbarContainer.js'
import NoMatch from './common/components/NoMatch'
import TicketListInfobarContainer from './tickets/list/TicketListInfobarContainer'
import withUserRoleRequired from './common/components/UserRoleRequired'
import BillingContainer from './settings/billing/BillingContainer.js'
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
import RulesSettingsForm from './settings/rules/RulesSettingsForm'
import TeamList from './settings/users/List'
import TeamForm from './settings/users/Form'
import TeamsList from './settings/teams/List'
import TeamsForm from './settings/teams/Form'
import List from './settings/teams/members/List'

import UserAuditList from './settings/audit/UserAuditList'
import BusinessHours from './settings/businessHours/index.js'
import TicketAssignment from './settings/ticketAssignment/index.js'

import withPaywall from './common/utils/withPaywall'
import OnboardingContent from './onboarding/OnboardingContent'
import SelfServicePreferencesContainer from './settings/selfService/components/PreferencesView'
import SelfServiceCancellationsPolicyContainer from './settings/selfService/components/CancellationsPolicyView'
import SelfServiceReturnsPolicyContainer from './settings/selfService/components/ReturnsPolicyView'
import SelfServiceReportIssuePolicyContainer from './settings/selfService/components/ReportIssuePolicyView/index'
import SelfServiceReportIssueCaseEditorContainer from './settings/selfService/components/ReportIssueCaseEditor/index'
import HelpCenterStartView from './settings/helpCenter/components/HelpCenterStartView'
import HelpCenterNewView from './settings/helpCenter/components/HelpCenterNewView'
import {CurrentHelpCenter} from './settings/helpCenter/providers/CurrentHelpCenter/CurrentHelpCenter'

const appRender = (props: {
    navbar: ComponentType<any>
    content: ComponentType<any>
    infobar?: ComponentType<any>
    containerPadding?: boolean
    infobarOnMobile?: boolean
    noContainerWidthLimit?: boolean
    isEditingWidgets?: boolean
}) => (routeProps: RouteComponentProps) => {
    return <App {...routeProps} {...props} />
}

export default function Routes() {
    return (
        <Switch>
            <Route path="/app" component={AppRoutes} />
        </Switch>
    )
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
            <Route
                path={`${path}/stats`}
                render={(props) => <StatsRoutes {...props} />}
            />
            <Route path={`${path}/settings`} render={SettingsRoutes} />
            <Route
                path={`${path}/home`}
                exact
                render={appRender({
                    content: OnboardingContent,
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
    const hasLiveOverviewFeature = useSelector(
        currentAccountHasFeature(AccountFeature.OverviewLiveStatistics)
    )

    return (
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
                path={`${path}/:view`}
                exact
                render={appRender({
                    content: DEPRECATED_StatsPage,
                    navbar: StatsNavbarContainer,
                })}
            />
        </Switch>
    )
}

export function SettingsRoutes({match: {path}}: RouteComponentProps) {
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
                render={SelfServiceSettingsRoutes}
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
                path={`${path}/change-password`}
                exact
                render={appRender({
                    content: ChangePassword,
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
                    content: withUserRoleRequired(UserAuditList, ADMIN_ROLE),
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
                        AGENT_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route path={`${path}/import-data`} render={ImportSettingsRoutes} />
            <Route
                path={`${path}/satisfaction-surveys`}
                exact
                render={appRender({
                    content: withPaywall(AccountFeature.SatisfactionSurveys)(
                        withUserRoleRequired(SatisfactionSurveyView, ADMIN_ROLE)
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/business-hours`}
                render={appRender({
                    content: withUserRoleRequired(BusinessHours, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
                exact
            />
            <Route
                path={`${path}/ticket-assignment`}
                exact
                render={appRender({
                    content: withPaywall(AccountFeature.AutoAssignment)(
                        withUserRoleRequired(TicketAssignment, ADMIN_ROLE)
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
                        IntegrationListContainer,
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        IntegrationDetailContainer,
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}

export function HelpCenterSettingsRoutes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        HelpCenterStartView,
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/new`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        HelpCenterNewView,
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:helpcenterId`}
                render={appRender({
                    content: withUserRoleRequired(
                        CurrentHelpCenter,
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}

export function SelfServiceSettingsRoutes({
    match: {path},
}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServiceContainer,
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:integrationType/:shopName/preferences`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        SelfServicePreferencesContainer,
                        ADMIN_ROLE
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
                        ADMIN_ROLE
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
                        ADMIN_ROLE
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
                        ADMIN_ROLE
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
                        ADMIN_ROLE
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
                        AGENT_ROLE
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
                        AGENT_ROLE
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
                        AGENT_ROLE
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
                    content: withUserRoleRequired(RulesView, AGENT_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/new`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        RulesSettingsForm,
                        AGENT_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:ruleId`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        RulesSettingsForm,
                        AGENT_ROLE
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
                    content: withPaywall(AccountFeature.Teams)(
                        withUserRoleRequired(TeamsList as any, ADMIN_ROLE)
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/create`}
                exact
                render={appRender({
                    content: withPaywall(AccountFeature.Teams)(
                        withUserRoleRequired(TeamsForm, ADMIN_ROLE)
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={appRender({
                    content: withPaywall(AccountFeature.Teams)(
                        withUserRoleRequired(TeamsForm, ADMIN_ROLE)
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id/members`}
                exact
                render={appRender({
                    content: withPaywall(AccountFeature.Teams)(
                        withUserRoleRequired(List, ADMIN_ROLE)
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
                    content: withUserRoleRequired(TeamList as any, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/add`}
                exact
                render={appRender({
                    content: withUserRoleRequired(TeamForm, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={appRender({
                    content: withUserRoleRequired(TeamForm, ADMIN_ROLE),
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
                    content: withUserRoleRequired(BillingContainer, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/add-credit-card`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        CreditCardContainer,
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/update-credit-card`}
                exact
                render={appRender({
                    content: withUserRoleRequired(
                        CreditCardContainer,
                        ADMIN_ROLE
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
                        ADMIN_ROLE
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
                        ADMIN_ROLE
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
                        ADMIN_ROLE
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
                        ADMIN_ROLE
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
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}
