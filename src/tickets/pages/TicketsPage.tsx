import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { Handle } from 'core/layout/panels'
import { ContentPanels } from 'core/ui'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { TicketsNavbarPanel } from 'tickets/navigation'
import { TicketDetailPanel } from 'tickets/ticket-detail'
import { TicketEmptyPanel } from 'tickets/ticket-empty'
import { TicketInfobarPanel } from 'tickets/ticket-infobar'
import { TicketsListPanel } from 'tickets/tickets-list'
import { ViewPanel } from 'tickets/view'

export function TicketsPage() {
    const { path } = useRouteMatch()
    const { isEnabled } = useSplitTicketView()

    return (
        <>
            <TicketsNavbarPanel />
            <Handle />
            <ContentPanels subtractSize={10}>
                <Switch>
                    <Route exact path={`${path}/new/:visibility?`}>
                        <ViewPanel key="view-panel" />
                    </Route>
                    <Route exact path={`${path}/search`}>
                        <ViewPanel key="view-panel" />
                    </Route>
                    <Route path={`${path}/:viewId/:ticketId`}>
                        {isEnabled && (
                            <>
                                <TicketsListPanel key="ticket-list-panel" />
                                <Handle />
                            </>
                        )}
                        <TicketDetailPanel key="ticket-detail-panel" />
                        <Handle />
                        <TicketInfobarPanel key="infobar-panel" />
                    </Route>
                    <Route path={`${path}/:viewId?`}>
                        {isEnabled ? (
                            <>
                                <TicketsListPanel key="ticket-list-panel" />
                                <Handle />
                                <TicketEmptyPanel />
                            </>
                        ) : (
                            <ViewPanel />
                        )}
                    </Route>
                </Switch>
            </ContentPanels>
        </>
    )
}
