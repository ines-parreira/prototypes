//@flow
import React from 'react'
import {IndexRedirect, IndexRoute, Route} from 'react-router'

import {ADMIN_ROLE, AGENT_ROLE} from '../config/user'

import App from './App'
import IntegrationDetailContainer from './integrations/detail/IntegrationDetailContainer'
import IntegrationListContainer from './integrations/list/IntegrationListContainer'
import TicketDetailContainer from './tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from './tickets/detail/TicketInfobarContainer'
import TicketSourceContainer from './tickets/detail/TicketSourceContainer'
import TicketNavbarContainer from './tickets/common/TicketNavbarContainer'
import TicketListContainer from './tickets/list/TicketListContainer'
import RuleContainer from './settings/rules/list/RuleContainer'
import CustomerListContainer from './customers/list/CustomerListContainer'
import CustomerNavbarContainer from './customers/common/CustomerNavbarContainer'
import CustomerDetailContainer from './customers/detail/CustomerDetailContainer'
import CustomerSourceContainer from './customers/detail/CustomerSourceContainer'
import CustomerInfobarContainer from './customers/detail/CustomerInfobarContainer'
import StatsPage from './stats/StatsPage'

import YourProfileContainer from './settings/yourProfile/YourProfileContainer'
import ChangePasswordContainer from './settings/yourProfile/ChangePasswordContainer'
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
import ImportDataContainer from './settings/importData/ImportDataContainer'
import ImportZendeskDetail from './settings/importData/zendesk/ImportZendeskDetail'
import SatisfactionSurveyView from './settings/satisfactionSurveys/SatisfactionSurveyView'
import MacrosSettingsContent from './settings/macros/MacrosSettingsContent'
import MacrosSettingsForm from './settings/macros/MacrosSettingsForm'

import * as Team from './settings/users'
import * as Teams from './settings/teams'
import List from './settings/teams/members/List'

import UserAuditList from './settings/audit/UserAuditList'
import BusinessHours from './settings/businessHours'
import TicketAssignment from './settings/ticketAssignment'


export default (
    <Route
        path="/app"
        component={App}
    >
        <IndexRoute
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
        />
        <Route
            path="customers"
            components={{
                content: CustomerListContainer,
                navbar: CustomerNavbarContainer
            }}
        />
        <Route
            path="customers/new"
            components={{
                content: CustomerListContainer,
                navbar: CustomerNavbarContainer
            }}
        />
        <Route
            path="customers/search"
            components={{
                content: CustomerListContainer,
                navbar: CustomerNavbarContainer
            }}
        />
        <Route
            path="customers/:viewId(/:viewSlug)"
            components={{
                content: CustomerListContainer,
                navbar: CustomerNavbarContainer
            }}
        />
        <Route
            path="customer/:customerId"
            components={{
                content: CustomerDetailContainer,
                navbar: CustomerNavbarContainer,
                infobar: CustomerInfobarContainer
            }}
            noContainerWidthLimit // no width limit in App wrapper
            infobarOnMobile // show Infobar component on mobile
            containerPadding
        />
        <Route
            path="customer/:customerId/edit-widgets"
            components={{
                content: CustomerSourceContainer,
                navbar: CustomerNavbarContainer,
                infobar: CustomerInfobarContainer
            }}
            isEditingWidgets // is an edition mode route for widgets
            noContainerWidthLimit // no width limit in App wrapper
            containerPadding
        />
        {/* TODO(customers-migration): Remove these routes when we updated all routes in our app */}
        <Route
            path="users"
            components={{
                content: CustomerListContainer,
                navbar: CustomerNavbarContainer
            }}
        />
        <Route
            path="users/new"
            components={{
                content: CustomerListContainer,
                navbar: CustomerNavbarContainer
            }}
        />
        <Route
            path="users/search"
            components={{
                content: CustomerListContainer,
                navbar: CustomerNavbarContainer
            }}
        />
        <Route
            path="users/:viewId(/:viewSlug)"
            components={{
                content: CustomerListContainer,
                navbar: CustomerNavbarContainer
            }}
        />
        <Route
            path="user/:customerId"
            components={{
                content: CustomerDetailContainer,
                navbar: CustomerNavbarContainer,
                infobar: CustomerInfobarContainer
            }}
            noContainerWidthLimit // no width limit in App wrapper
            infobarOnMobile // show Infobar component on mobile
            containerPadding
        />
        <Route
            path="user/:customerId/edit-widgets"
            components={{
                content: CustomerSourceContainer,
                navbar: CustomerNavbarContainer,
                infobar: CustomerInfobarContainer
            }}
            isEditingWidgets // is an edition mode route for widgets
            noContainerWidthLimit // no width limit in App wrapper
            containerPadding
        />
        <Route
            path="ticket/:ticketId"
            components={{
                content: TicketDetailContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketInfobarContainer
            }}
            infobarOnMobile // show Infobar component on mobile
        />
        <Route
            path="ticket/:ticketId/edit-widgets"
            components={{
                content: TicketSourceContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketInfobarContainer
            }}
            noContainerWidthLimit // no width limit in App wrapper
            isEditingWidgets // is an edition mode route for widgets
            containerPadding
        />
        <Route
            path="tickets"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
        />
        <Route
            path="tickets/new"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
        />
        <Route
            path="tickets/search"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
        />
        <Route
            path="tickets/:viewId(/:viewSlug)"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
        />
        <Route path="stats">
            <IndexRedirect to="overview" />
            <Route
                path=":view"
                components={{
                    content: StatsPage,
                    navbar: StatsNavbarContainer
                }}
            />
        </Route>
        <Route path="settings">
            <IndexRoute
                components={{
                    content: YourProfileContainer,
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="integrations"
                components={{
                    content: UserRoleRequired(IntegrationListContainer, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="integrations/:integrationType"
                components={{
                    content: UserRoleRequired(IntegrationDetailContainer, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            >
                <Route path=":integrationId(/:extra)"/>
                <Route path=":integrationId/:extra/:subId"/>
            </Route>
            <Route
                path="macros"
                components={{
                    content: UserRoleRequired(MacrosSettingsContent, AGENT_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="macros/new"
                components={{
                    content: UserRoleRequired(MacrosSettingsForm, AGENT_ROLE),
                    navbar: SettingsNavbarContainer,
                }}
            />
            <Route
                path="macros/:macroId"
                components={{
                    content: UserRoleRequired(MacrosSettingsForm, AGENT_ROLE),
                    navbar: SettingsNavbarContainer,
                }}
            />
            <Route
                path="rules"
                components={{
                    content: UserRoleRequired(RuleContainer, AGENT_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="profile"
                components={{
                    content: YourProfileContainer,
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="change-password"
                components={{
                    content: ChangePasswordContainer,
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="api"
                components={{
                    content: APIView,
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="audit"
                components={{
                    content: UserRoleRequired(UserAuditList, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route path="teams">
                <IndexRoute
                    components={{
                        content: UserRoleRequired(Teams.List, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="create"
                    components={{
                        content: UserRoleRequired(Teams.Form, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path=":id"
                    components={{
                        content: UserRoleRequired(Teams.Form, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path=":id/members"
                    components={{
                        content: UserRoleRequired(List, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
            </Route>
            <Route path="users">
                <IndexRoute
                    components={{
                        content: UserRoleRequired(Team.List, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="add"
                    components={{
                        content: UserRoleRequired(Team.Form, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path=":id"
                    components={{
                        content: UserRoleRequired(Team.Form, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
            </Route>
            <Route path="billing">
                <IndexRoute
                    components={{
                        content: UserRoleRequired(BillingContainer, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="add-credit-card"
                    components={{
                        content: UserRoleRequired(CreditCardContainer, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="update-credit-card"
                    components={{
                        content: UserRoleRequired(CreditCardContainer, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="update-billing-details"
                    components={{
                        content: UserRoleRequired(BillingDetailsFormContainer, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="plans"
                    components={{
                        content: UserRoleRequired(BillingPlansContainer, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
            </Route>
            <Route
                path="manage-tags"
                components={{
                    content: UserRoleRequired(ManageTagsContainer, AGENT_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route path="import-data">
                <IndexRoute
                    components={{
                        content: UserRoleRequired(ImportDataContainer, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="zendesk"
                    components={{
                        content: UserRoleRequired(ImportZendeskDetail, ADMIN_ROLE),
                        navbar: SettingsNavbarContainer
                    }}
                />
            </Route>
            <Route
                path="satisfaction-surveys"
                components={{
                    content: UserRoleRequired(SatisfactionSurveyView, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="business-hours"
                components={{
                    content: UserRoleRequired(BusinessHours, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="ticket-assignment"
                components={{
                    content: UserRoleRequired(TicketAssignment, ADMIN_ROLE),
                    navbar: SettingsNavbarContainer
                }}
            />
        </Route>
        <Route
            path="*"
            component={NoMatch}
            containerPadding
        />
    </Route>
)
