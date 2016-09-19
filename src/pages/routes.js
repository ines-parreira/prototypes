import React from 'react'
import {IndexRoute, Route} from 'react-router'
import App from './App'
import IntegrationDetailContainer from './integrations/detail/IntegrationDetailContainer'
import IntegrationListContainer from './integrations/list/IntegrationListContainer'
import TicketDetailContainer from './tickets/detail/TicketDetailContainer'
import IntegrationNavbarContainer from './integrations/common/IntegrationNavbarContainer'
import TicketInfobarContainer from './tickets/detail/TicketInfobarContainer'
import TicketNavbarContainer from './tickets/common/TicketNavbarContainer'
import TicketListContainer from './tickets/list/TicketListContainer'
import RuleContainer from './rules/list/RuleContainer'
import UserListContainer from './users/list/UserListContainer'
import UserNavbarContainer from './users/common/UserNavbarContainer'
import UserDetailContainer from './users/detail/UserDetailContainer'
import StatsContainer from './stats/list/StatsContainer'
import StatsNavbarContainer from './stats/common/StatsNavbarContainer'
import NoMatch from './common/components/NoMatch'
import WidgetsEditorContainer from './tickets/detail/WidgetsEditorContainer'

export default (
    <Route path="/app" component={App}>
        <IndexRoute components={{content: TicketListContainer, navbar: TicketNavbarContainer}} />
        <Route path="users" components={{content: UserListContainer, navbar: UserNavbarContainer}} />
        <Route path="users/:userId" components={{content: UserDetailContainer, navbar: UserNavbarContainer}} />
        <Route path="ticket/:ticketId" components={{
            content: TicketDetailContainer,
            navbar: TicketNavbarContainer,
            infobar: TicketInfobarContainer
        }} />
        <Route path="ticket/:ticketId/edit-widgets"
               components={{
                   content: WidgetsEditorContainer,
                   navbar: TicketNavbarContainer,
                   infobar: TicketInfobarContainer
               }}
               isEditingWidgets
        />
        <Route path="tickets/:viewId/:viewSlug"
               components={{content: TicketListContainer, navbar: TicketNavbarContainer}}
        />
        <Route path="integrations"
               components={{content: IntegrationListContainer, navbar: IntegrationNavbarContainer}}
        />
        <Route path="integrations/:integrationType"
               components={{content: IntegrationDetailContainer, navbar: IntegrationNavbarContainer}}
        >
            <Route path=":integrationId" />
        </Route>
        <Route path="rules" component={RuleContainer} />
        <Route path="stats"
               components={{content: StatsContainer, navbar: StatsNavbarContainer}}
        />
        <Route path="*" component={NoMatch} />
    </Route>
)
