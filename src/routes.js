import React from 'react'
import { IndexRoute, Route } from 'react-router'

import App from './containers/App'
import Dashboard from './containers/Dashboard'
import TicketContainer from './containers/Ticket'
import TicketInfobarContainer from './containers/TicketInfobar'
import TicketsContainer from './containers/Tickets'
import RuleContainer from './containers/Rule'
import UsersContainer from './containers/Users'
import UserContainer from './containers/User'
import NoMatch from './components/NoMatch'

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Dashboard}/>
        <Route path="users" component={UsersContainer}/>
        <Route path="users/:userId" component={UserContainer}/>
        <Route path="rules" component={RuleContainer}/>
        <Route path="ticket/:ticketId" components={{ content: TicketContainer, infobar: TicketInfobarContainer }}/>
        <Route path="tickets/:view" component={TicketsContainer}/>
        <Route path="*" component={NoMatch}/>
    </Route>
)
