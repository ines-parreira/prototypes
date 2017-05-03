import React from 'react'
import {IndexRoute, Route} from 'react-router'
import App from './App'
import IntegrationDetailContainer from './integrations/detail/IntegrationDetailContainer'
import IntegrationListContainer from './integrations/list/IntegrationListContainer'
import TicketDetailContainer from './tickets/detail/TicketDetailContainer'
import IntegrationNavbarContainer from './integrations/common/IntegrationNavbarContainer'
import TicketInfobarContainer from './tickets/detail/TicketInfobarContainer'
import TicketSourceContainer from './tickets/detail/TicketSourceContainer'
import TicketNavbarContainer from './tickets/common/TicketNavbarContainer'
import TicketListContainer from './tickets/list/TicketListContainer'
import RuleContainer from './rules/list/RuleContainer'
import UserListContainer from './users/list/UserListContainer'
import UserNavbarContainer from './users/common/UserNavbarContainer'
import UserDetailContainer from './users/detail/UserDetailContainer'
import UserSourceContainer from './users/detail/UserSourceContainer'
import UserInfobarContainer from './users/detail/UserInfobarContainer'
import OverviewStatsContainer from './stats/overview/OverviewStatsContainer'
import SimpleStatsContainer from './stats/simple/SimpleStatsContainer'


import YourProfileContainer from './settings/yourProfile/YourProfileContainer'
import ChangePasswordContainer from './settings/yourProfile/ChangePasswordContainer'
import ApiKeyView from './settings/apiKey/ApiKeyView'

import SettingsNavbarContainer from './settings/common/SettingsNavbarContainer'
import StatsNavbarContainer from './stats/common/StatsNavbarContainer'
import NoMatch from './common/components/NoMatch'
import RulesNavbarContainer from './rules/common/RulesNavbarContainer'
import TicketListInfobarContainer from './tickets/list/TicketListInfobarContainer'
import UserRoleRequired from './common/components/UserRoleRequired'
import BillingContainer from './settings/billing/BillingContainer'
import CreditCardContainer from './settings/billing/credit-cards/CreditCardContainer'
import ManageTagsContainer from './settings/manageTags/ManageTags'

import * as Team from './settings/team'

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
            noContainerPadding
        />
        <Route
            path="users"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
            noContainerPadding
        />
        <Route
            path="users/new"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
            noContainerPadding
        />
        <Route
            path="users/search"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
            noContainerPadding
        />
        <Route
            path="users/:viewId(/:viewSlug)"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
            noContainerPadding
        />
        <Route
            path="user/:userId"
            components={{
                content: UserDetailContainer,
                navbar: UserNavbarContainer,
                infobar: UserInfobarContainer
            }}
            noContainerWidthLimit
        />
        <Route
            path="user/:userId/edit-widgets"
            components={{
                content: UserSourceContainer,
                navbar: UserNavbarContainer,
                infobar: UserInfobarContainer
            }}
            isEditingWidgets
            noContainerWidthLimit
        />
        <Route
            path="ticket/:ticketId"
            components={{
                content: TicketDetailContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketInfobarContainer
            }}
            noContainerWidthLimit
        />
        <Route
            path="ticket/:ticketId/edit-widgets"
            components={{
                content: TicketSourceContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketInfobarContainer
            }}
            isEditingWidgets
            noContainerWidthLimit
        />
        <Route
            path="tickets"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
            noContainerPadding
        />
        <Route
            path="tickets/new"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
            noContainerPadding
        />
        <Route
            path="tickets/search"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
            noContainerPadding
        />
        <Route
            path="tickets/:viewId(/:viewSlug)"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
            noContainerPadding
        />
        <Route
            path="integrations"
            components={{
                content: IntegrationListContainer,
                navbar: IntegrationNavbarContainer
            }}
        />
        <Route
            path="integrations/:integrationType"
            components={{
                content: IntegrationDetailContainer,
                navbar: IntegrationNavbarContainer
            }}
        >
            <Route path=":integrationId" />
        </Route>
        <Route
            path="rules"
            components={{
                content: RuleContainer,
                navbar: RulesNavbarContainer
            }}
            noContainerWidthLimit
        />
        <Route
            path="stats"
            components={{
                content: OverviewStatsContainer,
                navbar: StatsNavbarContainer
            }}
        />
        <Route
            path="stats/:type"
            components={{
                content: SimpleStatsContainer,
                navbar: StatsNavbarContainer
            }}
        />
        <Route path="settings">
            <IndexRoute
                components={{
                    content: YourProfileContainer,
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
                    content: ApiKeyView,
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route path="team">
                <IndexRoute
                    components={{
                        content: UserRoleRequired(Team.List, 'admin'),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="add"
                    components={{
                        content: UserRoleRequired(Team.Form, 'admin'),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="update/:id"
                    components={{
                        content: UserRoleRequired(Team.Form, 'admin'),
                        navbar: SettingsNavbarContainer
                    }}
                />
            </Route>
            <Route path="billing">
                <IndexRoute
                    components={{
                        content: UserRoleRequired(BillingContainer, 'admin'),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="add-credit-card"
                    components={{
                        content: UserRoleRequired(CreditCardContainer, 'admin'),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="update-credit-card"
                    components={{
                        content: UserRoleRequired(CreditCardContainer, 'admin'),
                        navbar: SettingsNavbarContainer
                    }}
                />
            </Route>
            <Route
                path="manage-tags"
                components={{
                    content: UserRoleRequired(ManageTagsContainer, 'admin'),
                    navbar: SettingsNavbarContainer
                }}
            />
        </Route>
        <Route path="*" component={NoMatch} />
    </Route>
)
