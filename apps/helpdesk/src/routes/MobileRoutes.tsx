import { Route, Switch } from 'react-router-dom'

import { DefaultExportLegacyPage as LegacyPage } from 'pages/LegacyPage'
import { DefaultExportTicketInfobarContainer as TicketInfobarContainer } from 'pages/tickets/detail/TicketInfobarContainer'
import { TicketList } from 'pages/tickets/list/TicketList'
import { DefaultExportTicketNavbar as TicketNavbar } from 'pages/tickets/navbar/TicketNavbar'
import { TicketWrapper } from 'split-ticket-view/components/TicketWrapper'

export function MobileRoutes() {
    return (
        <Switch>
            <Route exact path="/app">
                <LegacyPage content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/tickets">
                <LegacyPage content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/tickets/new/:visibility?">
                <LegacyPage content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/tickets/search">
                <LegacyPage content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/tickets/:viewId/:viewSlug?">
                <LegacyPage content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/ticket/:ticketId">
                <LegacyPage
                    content={TicketWrapper}
                    navbar={TicketNavbar}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            </Route>
            <Route exact path="/app/views/:viewId?">
                <LegacyPage content={TicketList} navbar={TicketNavbar} />
            </Route>
            <Route exact path="/app/views/:viewId/:ticketId">
                <LegacyPage
                    content={TicketWrapper}
                    navbar={TicketNavbar}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            </Route>
        </Switch>
    )
}
