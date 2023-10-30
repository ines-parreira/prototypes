import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'
import {EmptyTicket} from 'ticket-page'

import DefaultViewFallback from './DefaultViewFallback'

type Params = {
    viewId?: string
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
                <DefaultViewFallback viewId={viewId} />
            </Panel>
            <Panel>
                <EmptyTicket />
            </Panel>
        </Panels>
    )
}
