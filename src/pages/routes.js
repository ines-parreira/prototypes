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
import RuleContainer from './settings/rules/list/RuleContainer'
import UserListContainer from './users/list/UserListContainer'
import UserNavbarContainer from './users/common/UserNavbarContainer'
import UserDetailContainer from './users/detail/UserDetailContainer'
import UserSourceContainer from './users/detail/UserSourceContainer'
import UserInfobarContainer from './users/detail/UserInfobarContainer'
import StatsViewContainer from './stats/StatsViewContainer'

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
import ManageTagsContainer from './settings/tags/ManageTags'
import ImportDataContainer from './settings/importData/ImportDataContainer'
import ImportZendeskDetail from './settings/importData/zendesk/ImportZendeskDetail'

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
            noContainerPadding // no padding in App wrapper
        />
        <Route
            path="users"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
            noContainerPadding // no padding in App wrapper
        />
        <Route
            path="users/new"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
            noContainerPadding // no padding in App wrapper
        />
        <Route
            path="users/search"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
            noContainerPadding // no padding in App wrapper
        />
        <Route
            path="users/:viewId(/:viewSlug)"
            components={{
                content: UserListContainer,
                navbar: UserNavbarContainer
            }}
            noContainerPadding // no padding in App wrapper
        />
        <Route
            path="user/:userId"
            components={{
                content: UserDetailContainer,
                navbar: UserNavbarContainer,
                infobar: UserInfobarContainer
            }}
            noContainerWidthLimit // no width limit in App wrapper
            infobarOnMobile // show Infobar component on mobile
        />
        <Route
            path="user/:userId/edit-widgets"
            components={{
                content: UserSourceContainer,
                navbar: UserNavbarContainer,
                infobar: UserInfobarContainer
            }}
            isEditingWidgets // is an edition mode route for widgets
            noContainerWidthLimit // no width limit in App wrapper
        />
        <Route
            path="ticket/:ticketId"
            components={{
                content: TicketDetailContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketInfobarContainer
            }}
            noContainerPadding // no padding in App wrapper
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
        />
        <Route
            path="tickets"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
            noContainerPadding // no padding in App wrapper
        />
        <Route
            path="tickets/new"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
            noContainerPadding // no padding in App wrapper
        />
        <Route
            path="tickets/search"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
            noContainerPadding // no padding in App wrapper
        />
        <Route
            path="tickets/:viewId(/:viewSlug)"
            components={{
                content: TicketListContainer,
                navbar: TicketNavbarContainer,
                infobar: TicketListInfobarContainer,
            }}
            noContainerPadding // no padding in App wrapper
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
            <Route path=":integrationId(/:extra)" />
        </Route>
        <Route
            path="stats(/:view)"
            components={{
                content: StatsViewContainer,
                navbar: StatsNavbarContainer
            }}
            noContainerWidthLimit
        />
        <Route path="settings">
            <IndexRoute
                components={{
                    content: YourProfileContainer,
                    navbar: SettingsNavbarContainer
                }}
            />
            <Route
                path="rules"
                components={{
                    content: RuleContainer,
                    navbar: SettingsNavbarContainer
                }}
                noContainerWidthLimit // no width limit in App wrapper
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
            <Route path="import-data">
                <IndexRoute
                    components={{
                        content: UserRoleRequired(ImportDataContainer, 'admin'),
                        navbar: SettingsNavbarContainer
                    }}
                />
                <Route
                    path="zendesk"
                    components={{
                        content: UserRoleRequired(ImportZendeskDetail, 'admin'),
                        navbar: SettingsNavbarContainer
                    }}
                />
            </Route>
        </Route>
        <Route path="*" component={NoMatch} />
    </Route>
)
