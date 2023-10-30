import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketDetail from 'pages/tickets/detail/TicketDetailContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import {Config, Panel, Panels} from 'panels'

import DefaultViewFallback from './DefaultViewFallback'

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
                <DefaultViewFallback viewId={viewId} />
            </Panel>
            <Panel>
                <TicketDetail />
            </Panel>
            <Panel>
                <TicketInfobarContainer isOnNewLayout />
            </Panel>
        </Panels>
    )
}
