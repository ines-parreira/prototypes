import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketDetail from 'pages/tickets/detail/TicketDetailContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'
import {TicketListView} from 'ticket-list-view'

type Params = {
    viewId: string
}

export default function TicketLayout({
    match: {
        params: {viewId},
    },
}: RouteComponentProps<Params>) {
    const panelsConfig: Config = [
        [238, 200, 350],
        [300, 300, 450],
        [Infinity, 300],
        [Infinity, 340, 400],
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
                <TicketDetail />
            </Panel>
            <Panel>
                <p>infobar</p>
            </Panel>
        </Panels>
    )
}
