//@flow
import React, {type ComponentType} from 'react'
import {
    Route,
    Switch,
    Redirect,
    type RouteComponentProps,
} from 'react-router-dom'

import {ADMIN_ROLE, AGENT_ROLE} from '../config/user.ts'

import App from './App'
import IntegrationDetailContainer from './integrations/detail/IntegrationDetailContainer'
import IntegrationListContainer from './integrations/list/IntegrationListContainer'
import TicketDetailContainer from './tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from './tickets/detail/TicketInfobarContainer'
import TicketSourceContainer from './tickets/detail/TicketSourceContainer'
import TicketNavbar from './tickets/navbar/TicketNavbar.tsx'
import TicketListContainer from './tickets/list/TicketListContainer'
import RuleContainer from './settings/rules/list/RuleContainer.ts'
import CustomerListContainer from './customers/list/CustomerListContainer'
import CustomerNavbarContainer from './customers/common/CustomerNavbarContainer'
import CustomerDetailContainer from './customers/detail/CustomerDetailContainer'
import CustomerSourceContainer from './customers/detail/CustomerSourceContainer'
import CustomerInfobarContainer from './customers/detail/CustomerInfobarContainer'
import StatsPage from './stats/StatsPage'

import YourProfileContainer from './settings/yourProfile/YourProfileContainer'
import ChangePassword from './settings/yourProfile/ChangePassword'
import APIView from './settings/api/APIView'

import SettingsNavbarContainer from './settings/common/SettingsNavbarContainer'
import StatsNavbarContainer from './stats/common/StatsNavbarContainer'
import NoMatch from './common/components/NoMatch'
import TicketListInfobarContainer from './tickets/list/TicketListInfobarContainer'
import UserRoleRequired from './common/components/UserRoleRequired'
import BillingContainer from './settings/billing/BillingContainer'
import CreditCardContainer from './settings/billing/credit-cards/CreditCard'
import BillingDetailsFormContainer from './settings/billing/details/BillingDetailsForm'
import BillingPlansContainer from './settings/billing/plans/BillingPlans'
import ManageTagsContainer from './settings/tags/ManageTags'
import ImportZendeskDetail from './settings/importData/zendesk/ImportZendeskDetail.tsx'
import ImportDataContainer from './settings/importData/ImportDataContainer.tsx'
import ImportZendeskCreate from './settings/importData/zendesk/ImportZendeskCreate.tsx'
import SatisfactionSurveyView from './settings/satisfactionSurveys/SatisfactionSurveyView'
import MacrosSettingsContent from './settings/macros/MacrosSettingsContent.tsx'
import MacrosSettingsForm from './settings/macros/MacrosSettingsForm.tsx'
import * as Team from './settings/users'
import * as Teams from './settings/teams'
import List from './settings/teams/members/List'

import UserAuditList from './settings/audit/UserAuditList'
import BusinessHours from './settings/businessHours'
import TicketAssignment from './settings/ticketAssignment'

const appRender = (props: {
    navbar: ComponentType<any>,
    content: ComponentType<any>,
    infobar?: ComponentType<any>,
    containerPadding?: boolean,
    infobarOnMobile?: boolean,
    noContainerWidthLimit?: boolean,
    isEditingWidgets?: boolean,
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
                    infobar: TicketListInfobarContainer,
                })}
            />
            <Route path={`${path}/customers`} render={CustomersRoutes} />
            <Route path={`${path}/customer`} render={CustomerRoutes} />
            <Route path={`${path}/users`} render={UsersRoutes} />
            <Route path={`${path}/user`} render={UserRoutes} />
            <Route path={`${path}/ticket`} render={TicketRoutes} />
            <Route path={`${path}/tickets`} render={TicketsRoutes} />
            <Route path={`${path}/stats`} render={StatsRoutes} />
            <Route path={`${path}/settings`} render={SettingsRoutes} />
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
    return (
        <Switch>
            <Route
                exact
                path={`${path}/`}
                render={() => <Redirect to={`${path}/overview`} />}
            />
            <Route
                path={`${path}/:view`}
                exact
                render={appRender({
                    content: StatsPage,
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
            <Route path={`${path}/macros`} render={MacrosSettingsRoutes} />
            <Route
                path={`${path}/rules`}
                exact
                render={appRender({
                    content: UserRoleRequired(RuleContainer, AGENT_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
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
                    content: UserRoleRequired(UserAuditList, ADMIN_ROLE),
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
                    content: UserRoleRequired(ManageTagsContainer, AGENT_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route path={`${path}/import-data`} render={ImportSettingsRoutes} />
            <Route
                path={`${path}/satisfaction-surveys`}
                exact
                render={appRender({
                    content: UserRoleRequired(
                        SatisfactionSurveyView,
                        ADMIN_ROLE
                    ),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/business-hours`}
                render={appRender({
                    content: UserRoleRequired(BusinessHours, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
                exact
            />
            <Route
                path={`${path}/ticket-assignment`}
                exact
                render={appRender({
                    content: UserRoleRequired(TicketAssignment, ADMIN_ROLE),
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
                    content: UserRoleRequired(
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
                    content: UserRoleRequired(
                        IntegrationDetailContainer,
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
                    content: UserRoleRequired(
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
                    content: UserRoleRequired(MacrosSettingsForm, AGENT_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:macroId`}
                exact
                render={appRender({
                    content: UserRoleRequired(MacrosSettingsForm, AGENT_ROLE),
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
                    content: UserRoleRequired(Teams.List, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/create`}
                exact
                render={appRender({
                    content: UserRoleRequired(Teams.Form, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={appRender({
                    content: UserRoleRequired(Teams.Form, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id/members`}
                exact
                render={appRender({
                    content: UserRoleRequired(List, ADMIN_ROLE),
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
                    content: UserRoleRequired(Team.List, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/add`}
                exact
                render={appRender({
                    content: UserRoleRequired(Team.Form, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={appRender({
                    content: UserRoleRequired(Team.Form, ADMIN_ROLE),
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
                    content: UserRoleRequired(BillingContainer, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/add-credit-card`}
                exact
                render={appRender({
                    content: UserRoleRequired(CreditCardContainer, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/update-credit-card`}
                exact
                render={appRender({
                    content: UserRoleRequired(CreditCardContainer, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/update-billing-details`}
                exact
                render={appRender({
                    content: UserRoleRequired(
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
                    content: UserRoleRequired(
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
                    content: UserRoleRequired(ImportDataContainer, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/zendesk`}
                exact
                render={appRender({
                    content: UserRoleRequired(ImportZendeskCreate, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
            <Route
                path={`${path}/zendesk/:integrationId/:extra?`}
                exact
                render={appRender({
                    content: UserRoleRequired(ImportZendeskDetail, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer,
                })}
            />
        </Switch>
    )
}
