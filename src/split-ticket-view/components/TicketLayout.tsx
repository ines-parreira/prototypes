import React from 'react'
import {useParams} from 'react-router-dom'

import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'
import {TicketListView} from 'ticket-list-view'

type Params = {
    ticketId: string
    viewId: string
}

export default function Ticket() {
    const {ticketId, viewId} = useParams<Params>()

    const panelsConfig: Config = [
        [238, 200, 350],
        [300, 300, 450],
        [Infinity, 300],
        [Infinity, 300, 400],
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
                <p>ticket {ticketId}</p>
            </Panel>
            <Panel>
                <p>infobar</p>
            </Panel>
        </Panels>
    )
}
