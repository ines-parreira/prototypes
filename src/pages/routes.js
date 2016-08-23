import React from 'react'
import {IndexRoute, Route} from 'react-router'
import App from './App'
import IntegrationDetailContainer from './integrations/detail/IntegrationDetailContainer'
import IntegrationListContainer from './integrations/list/IntegrationListContainer'

import WelcomeContainer from './welcome/WelcomeContainer'
import TicketDetailContainer from './tickets/detail/TicketDetailContainer'
import IntegrationNavbarContainer from './integrations/common/IntegrationNavbarContainer'
import TicketInfobarContainer from './tickets/detail/TicketInfobarContainer'
import TicketNavbarContainer from './tickets/common/TicketNavbarContainer'
import TicketListContainer from './tickets/list/TicketListContainer'
import RuleContainer from './rules/RuleContainer'
import UserListContainer from './users/list/UserListContainer'
import UserNavbarContainer from './users/common/UserNavbarContainer'
import UserDetailContainer from './users/detail/UserDetailContainer'
import NoMatch from './common/components/NoMatch'

export default (
    <Route path="/app" component={App}>
        <IndexRoute components={{content: WelcomeContainer, navbar: TicketNavbarContainer}} />
        <Route path="users" components={{content: UserListContainer, navbar: UserNavbarContainer}} />
        <Route path="users/:userId" components={{content: UserDetailContainer, navbar: UserNavbarContainer}} />
        <Route path="rules" component={RuleContainer} />
        <Route path="ticket/:ticketId" components={{
            content: TicketDetailContainer,
            navbar: TicketNavbarContainer,
            infobar: TicketInfobarContainer
        }} />
        <Route path="tickets/:view" components={{content: TicketListContainer, navbar: TicketNavbarContainer}} />
        <Route path="settings/integrations"
               components={{content: IntegrationListContainer, navbar: IntegrationNavbarContainer}}
        />
        <Route path="settings/integrations/:integrationType"
               components={{content: IntegrationDetailContainer, navbar: IntegrationNavbarContainer}}
        >
            <Route path=":integrationId" />
        </Route>
        <Route path="*" component={NoMatch} />
    </Route>
)
