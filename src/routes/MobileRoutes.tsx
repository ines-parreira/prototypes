import { Route, Switch } from 'react-router-dom'

import App from 'pages/App'
import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketList from 'pages/tickets/list/TicketList'
import { TicketNavBarRevampWrapper } from 'pages/tickets/navbar/v2/TicketNavBarRevampWrapper'

export function MobileRoutes() {
    return (
        <Switch>
            <Route exact path="/app">
                <App content={TicketList} navbar={TicketNavBarRevampWrapper} />
            </Route>
            <Route exact path="/app/tickets">
                <App content={TicketList} navbar={TicketNavBarRevampWrapper} />
            </Route>
            <Route exact path="/app/tickets/new/:visibility?">
                <App content={TicketList} navbar={TicketNavBarRevampWrapper} />
            </Route>
            <Route exact path="/app/tickets/search">
                <App content={TicketList} navbar={TicketNavBarRevampWrapper} />
            </Route>
            <Route exact path="/app/tickets/:viewId/:viewSlug?">
                <App content={TicketList} navbar={TicketNavBarRevampWrapper} />
            </Route>
            <Route exact path="/app/ticket/:ticketId">
                <App
                    content={TicketDetailContainer}
                    navbar={TicketNavBarRevampWrapper}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            </Route>
            <Route exact path="/app/views/:viewId?">
                <App content={TicketList} navbar={TicketNavBarRevampWrapper} />
            </Route>
            <Route exact path="/app/views/:viewId/:ticketId">
                <App
                    content={TicketDetailContainer}
                    navbar={TicketNavBarRevampWrapper}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            </Route>
        </Switch>
    )
}
