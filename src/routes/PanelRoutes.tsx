import React from 'react'
import {Route, Switch} from 'react-router-dom'

import PanelLayout from 'pages/PanelLayout'
import {useSplitTicketPage} from 'tickets/pages/SplitTicketPage'
import {useSplitViewPage} from 'tickets/pages/SplitViewPage'
import {useTicketPage} from 'tickets/pages/TicketPage'
import {useViewPage} from 'tickets/pages/ViewPage'

export const panelRoutesRegexps = [
    /^\/app\/?$/,
    /^\/app\/tickets\/?/,
    /^\/app\/ticket\/([^\/]+)\/?$/,
    /^\/app\/views\/?/,
]

export default function PanelRoutes() {
    const splitTicketLayoutProps = useSplitTicketPage()
    const splitViewLayoutProps = useSplitViewPage()
    const fullWidthTicketLayoutProps = useTicketPage()
    const fullWidthViewLayoutProps = useViewPage()

    return (
        <Switch>
            <Route exact path="/app">
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route exact path="/app/tickets">
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route exact path="/app/tickets/new/:visibility?">
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route exact path="/app/tickets/search">
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route exact path="/app/tickets/:viewId/:viewSlug?">
                <PanelLayout {...fullWidthViewLayoutProps} />
            </Route>
            <Route exact path="/app/ticket/:ticketId">
                <PanelLayout {...fullWidthTicketLayoutProps} />
            </Route>
            <Route exact path="/app/views/:viewId?">
                <PanelLayout {...splitViewLayoutProps} />
            </Route>
            <Route exact path="/app/views/:viewId/:ticketId">
                <PanelLayout {...splitTicketLayoutProps} />
            </Route>
        </Switch>
    )
}
