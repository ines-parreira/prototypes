import React from 'react'
import {IndexRoute, Route} from 'react-router'
import App from './containers/App'
import Dashboard from './containers/Dashboard'
import TicketContainer from './containers/Ticket'
import TicketInfobarContainer from './containers/TicketInfobar'
import TicketsNavbarContainer from './containers/TicketsNavbar'
import TicketsContainer from './containers/Tickets'
import RuleContainer from './containers/Rule'
import UsersContainer from './containers/Users'
import UserContainer from './containers/User'
import NoMatch from './components/NoMatch'

export default (
    <Route path="/app" component={App}>
        <IndexRoute components={{ content: Dashboard, navbar: TicketsNavbarContainer, activeContent: 'tickets' }}/>
        <Route path="users" components={{ content: UsersContainer, navbar: null, activeContent: 'users' }}/>
        <Route path="users/:userId" components={{ content: UserContainer, activeContent: 'users' }}/>
        <Route path="rules" component={RuleContainer}/>
        <Route path="ticket/:ticketId" components={{ content: TicketContainer, infobar: TicketInfobarContainer, activeContent: 'tickets' }}/>
        <Route path="tickets/:view" components={{ content: TicketsContainer, navbar: TicketsNavbarContainer, activeContent: 'tickets' }}/>
        <Route path="*" component={NoMatch}/>
    </Route>
)
