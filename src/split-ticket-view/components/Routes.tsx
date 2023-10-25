import React from 'react'
import {Route, RouteComponentProps, Switch} from 'react-router-dom'

import TicketLayout from './TicketLayout'
import ViewLayout from './ViewLayout'

export default function Routes({match: {path}}: RouteComponentProps) {
    return (
        <Switch>
            <Route exact path={`${path}/:viewId`} render={ViewLayout} />
            <Route
                exact
                path={`${path}/:viewId/:ticketId`}
                render={TicketLayout}
            />
        </Switch>
    )
}
