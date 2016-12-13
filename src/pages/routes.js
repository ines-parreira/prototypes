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
import SettingsNavbarContainer from './settings/common/SettingsNavbarContainer'
import StatsNavbarContainer from './stats/common/StatsNavbarContainer'
import NoMatch from './common/components/NoMatch'
import RulesNavbarContainer from './rules/common/RulesNavbarContainer'
import TicketListInfobarContainer from './tickets/list/TicketListInfobarContainer'
import AccountContainer from './settings/account/AccountContainer'
import UserRoleRequired from './common/components/UserRoleRequired'

export default (
    <Route path="/app" component={App}>
        <IndexRoute
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
        />
        <Route
            path="users"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
        />
        <Route
            path="users/new"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
        />
        <Route
            path="users/:viewId(/:viewSlug)"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
        />
        <Route
            path="user/:userId"
            components={{
                content: UserDetailContainer,
                navbar: UserNavbarContainer,
                infobar: UserInfobarContainer
            }}
        />
        <Route
            path="user/:userId/edit-widgets"
            components={{
                content: UserSourceContainer,
                navbar: UserNavbarContainer,
                infobar: UserInfobarContainer
            }}
            isEditingWidgets
        />
        <Route
            path="ticket/:ticketId"
            components={{
                content: TicketDetailContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketInfobarContainer
            }}
        />
        <Route
            path="ticket/:ticketId/edit-widgets"
            components={{
                content: TicketSourceContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketInfobarContainer
            }}
            isEditingWidgets
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
            path="tickets/:viewId(/:viewSlug)"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
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
            <Route path=":integrationId"/>
        </Route>
        <Route
            path="rules"
            components={{
                content: RuleContainer,
                navbar: RulesNavbarContainer
            }}
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
                    content: UserRoleRequired(
                        AccountContainer,
                        'admin',
                        '/app/settings/your-profile'
                    ),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="account"
                components={{
                    content: UserRoleRequired(AccountContainer, 'admin'),
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="your-profile"
                components={{
                    content: YourProfileContainer,
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="your-profile/change-password"
                components={{
                    content: ChangePasswordContainer,
                    navbar: SettingsNavbarContainer
                }}
            />
        </Route>
        <Route path="*" component={NoMatch}/>
    </Route>
)
