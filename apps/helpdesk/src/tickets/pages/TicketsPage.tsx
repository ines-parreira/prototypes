import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { Handle } from 'core/layout/panels'
import { ContentPanels } from 'core/ui'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { useOnToggleUnread } from 'tickets/dtp'
import { TicketsNavbarPanel } from 'tickets/navigation'
import { TicketDetailPanel } from 'tickets/ticket-detail'
import { TicketEmptyPanel } from 'tickets/ticket-empty'
import { TicketInfobarPanel } from 'tickets/ticket-infobar'
import { TicketsListPanel } from 'tickets/tickets-list'
import { ViewPanel } from 'tickets/view'

export function TicketsPage() {
    const { path } = useRouteMatch()
    const { isEnabled } = useSplitTicketView()
    const { onToggleUnread, registerOnToggleUnread } = useOnToggleUnread()

    const match = useRouteMatch<{ viewId?: string }>('/app/tickets/:viewId?')
    const viewId = match?.params.viewId || 'default'

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

                    <Route path={`${path}/:viewId?`}>
                        {isEnabled && (
                            <>
                                <TicketsListPanel
                                    key={`ticket-list-panel-${viewId}`}
                                    registerOnToggleUnread={
                                        registerOnToggleUnread
                                    }
                                />
                                <Handle />
                            </>
                        )}
                        <Switch>
                            <Route path={`${path}/:viewId/:ticketId`}>
                                <TicketDetailPanel
                                    key="ticket-detail-panel"
                                    onToggleUnread={onToggleUnread}
                                />
                                <Handle />
                                <TicketInfobarPanel key="infobar-panel" />
                            </Route>
                            <Route>
                                {isEnabled ? (
                                    <TicketEmptyPanel />
                                ) : (
                                    <ViewPanel />
                                )}
                            </Route>
                        </Switch>
                    </Route>
                </Switch>
            </ContentPanels>
        </>
    )
}
