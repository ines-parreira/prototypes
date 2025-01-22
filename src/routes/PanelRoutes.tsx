import React from 'react'
import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PanelGroup, Panels} from 'core/layout/panels'
import {GlobalNavigationPanel} from 'core/navigation'
import useWindowSize from 'hooks/useWindowSize'
import {useOnToggleUnread} from 'tickets/dtp'
import {TicketsNavbarPanel} from 'tickets/navigation'
import {TicketDetailPanel} from 'tickets/ticket-detail'
import {TicketEmptyPanel} from 'tickets/ticket-empty'
import {TicketInfobarPanel} from 'tickets/ticket-infobar'
import {TicketsListPanel} from 'tickets/tickets-list'
import {ViewPanel} from 'tickets/view'

import css from './PanelRoutes.less'

export const panelRoutesRegexps = [
    /^\/app\/?$/,
    /^\/app\/tickets\/?/,
    /^\/app\/ticket\/([^\/]+)\/?$/,
    /^\/app\/views\/?/,
]

export default function PanelRoutes() {
    const {width} = useWindowSize()
    const {onToggleUnread, registerOnToggleUnread} = useOnToggleUnread()

    const match = useRouteMatch<{viewId?: string}>('/app/views/:viewId?')
    const viewId = match?.params.viewId || 'default'

    // The `key` props below are not really needed in most cases, but they are
    // needed in the case of the `TicketListPanel`, `TicketDetailPanel` and
    // `TicketInfobarPanel`. When switching between the ticket routes, the
    // `TicketListPanel` can simply (dis)appear without the detail/infobar
    // panels re-rendering, but this can only be achieved by using react keys.
    return (
        <Panels size={width}>
            <GlobalNavigationPanel key="global-navigation" />
            <TicketsNavbarPanel key="navbar" />
            <PanelGroup className={css.contentGroup} subtractSize={18}>
                <Switch>
                    <Route exact path="/app">
                        <ViewPanel key="view-panel" />
                    </Route>
                    <Route exact path="/app/tickets">
                        <ViewPanel key="view-panel" />
                    </Route>
                    <Route exact path="/app/tickets/new/:visibility?">
                        <ViewPanel key="view-panel" />
                    </Route>
                    <Route exact path="/app/tickets/search">
                        <ViewPanel key="view-panel" />
                    </Route>
                    <Route exact path="/app/tickets/:viewId/:viewSlug?">
                        <ViewPanel key="view-panel" />
                    </Route>
                    <Route exact path="/app/ticket/:ticketId">
                        <TicketDetailPanel key="ticket-detail-panel" />
                        <TicketInfobarPanel key="infobar-panel" />
                    </Route>
                    <Route exact path="/app/views/:viewId?">
                        <TicketsListPanel key={`ticket-list-panel-${viewId}`} />
                        <TicketEmptyPanel key="ticket-empty-panel" />
                    </Route>
                    <Route exact path="/app/views/:viewId/:ticketId">
                        <TicketsListPanel
                            key={`ticket-list-panel-${viewId}`}
                            registerOnToggleUnread={registerOnToggleUnread}
                        />
                        <TicketDetailPanel
                            key="ticket-detail-panel"
                            onToggleUnread={onToggleUnread}
                        />
                        <TicketInfobarPanel key="infobar-panel" />
                    </Route>
                </Switch>
            </PanelGroup>
        </Panels>
    )
}
