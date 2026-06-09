import { Route, Switch } from 'react-router-dom'

import { MobileTicketHeaderActions } from 'pages/tickets/detail/MobileTicketHeaderActions'

export function MobileHeaderActions() {
    return (
        <Switch>
            <Route
                path={['/app/ticket/:ticketId', '/app/views/:viewId/:ticketId']}
            >
                <MobileTicketHeaderActions />
            </Route>
        </Switch>
    )
}
