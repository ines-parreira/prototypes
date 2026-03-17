import { Handle } from '@repo/layout'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { ContentPanels } from 'core/ui'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { useOnToggleUnread } from 'tickets/dtp'
import { TicketsNavbarPanel } from 'tickets/navigation'
import { TicketEmptyPanel } from 'tickets/ticket-empty'
import { TicketsListPanel } from 'tickets/tickets-list'
import { ViewPanelEntrypoint } from 'tickets/view'

import { TicketDetailWithInfobar } from './TicketDetailWithInfobar'

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
                        <ViewPanelEntrypoint key="view-panel" />
                    </Route>
                    <Route exact path={`${path}/search`}>
                        <ViewPanelEntrypoint key="view-panel" />
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
                                <TicketDetailWithInfobar
                                    onToggleUnread={onToggleUnread}
                                />
                            </Route>
                            <Route>
                                {isEnabled ? (
                                    <TicketEmptyPanel />
                                ) : (
                                    <ViewPanelEntrypoint />
                                )}
                            </Route>
                        </Switch>
                    </Route>
                </Switch>
            </ContentPanels>
        </>
    )
}
