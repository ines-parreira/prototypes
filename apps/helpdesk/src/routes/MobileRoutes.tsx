import { Route, Switch } from 'react-router-dom'

import App from 'pages/App'
import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketList from 'pages/tickets/list/TicketList'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'

export function MobileRoutes() {
    return (
        <Switch>
            <Route exact path="/app">
                <App content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/tickets">
                <App content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/tickets/new/:visibility?">
                <App content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/tickets/search">
                <App content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/tickets/:viewId/:viewSlug?">
                <App content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/ticket/:ticketId">
                <App
                    content={TicketDetailContainer}
                    navbar={TicketNavbar}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            </Route>
            <Route exact path="/app/views/:viewId?">
                <App content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/views/:viewId/:ticketId">
                <App
                    content={TicketDetailContainer}
                    navbar={TicketNavbar}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            </Route>
        </Switch>
    )
}
