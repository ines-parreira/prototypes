import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router-dom'

import TicketLayout from './TicketLayout'
import ViewLayout from './ViewLayout'

export default function Routes() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route exact path={`${path}/:viewId`}>
                <ViewLayout />
            </Route>
            <Route exact path={`${path}/:viewId/:ticketId`}>
                <TicketLayout />
            </Route>
        </Switch>
    )
}
