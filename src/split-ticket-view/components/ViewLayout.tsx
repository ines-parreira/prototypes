import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'
import {TicketListView} from 'ticket-list-view'
import EmptyTicket from 'ticket-page/components/EmptyTicket'

type Params = {
    viewId: string
}

export default function ViewLayout({
    match: {
        params: {viewId},
    },
}: RouteComponentProps<Params>) {
    const panelsConfig: Config = [
        [238, 200, 350],
        [300, 300, 450],
        [Infinity, 100, Infinity],
    ]

    return (
        <Panels config={panelsConfig}>
            <Panel>
                <TicketNavbar disableResize />
            </Panel>
            <Panel>
                <TicketListView viewId={viewId} />
            </Panel>
            <Panel>
                <EmptyTicket />
            </Panel>
        </Panels>
    )
}
