import React from 'react'
import {useParams} from 'react-router-dom'

import {Config, Panel, Panels} from 'panels'
import {TicketListView} from 'ticket-list-view'

type Params = {
    ticketId: string
    viewId: string
}

export default function Ticket() {
    const {ticketId, viewId} = useParams<Params>()

    const panelsConfig: Config = [
        [200, 200, 350],
        [300, 300, 450],
        [Infinity, 300],
        [Infinity, 300, 400],
    ]

    return (
        <Panels config={panelsConfig}>
            <Panel>
                <p>navbar</p>
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
