import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'
import {EmptyTicket} from 'ticket-page'

import storePanelWidths from '../utils/storePanelWidths'
import createInitialConfig from '../utils/createInitialConfig'
import {
    LayoutKeys,
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_TICKET_PANEL_WIDTH,
} from '../constants'
import DefaultViewFallback from './DefaultViewFallback'

const defaultPanelsConfig: Config = [
    [DEFAULT_NAVBAR_WIDTH, 200, 350],
    [DEFAULT_TICKET_PANEL_WIDTH, DEFAULT_TICKET_PANEL_WIDTH, 450],
    [Infinity, 100, Infinity],
]

const initialConfig = () =>
    createInitialConfig(LayoutKeys.VIEW, defaultPanelsConfig)

const handleResize = (widths: number[]) => {
    storePanelWidths(LayoutKeys.VIEW, widths)
}

type Params = {
    viewId?: string
}

export const ViewLayout = ({
    match: {
        params: {viewId},
    },
}: RouteComponentProps<Params>) => {
    return (
        <Panels config={initialConfig()} onResize={handleResize}>
            <Panel key="navbar-panel">
                <TicketNavbar disableResize />
            </Panel>
            <Panel key={`ticket-list-panel-${viewId || 'default'}`}>
                <DefaultViewFallback viewId={viewId} />
            </Panel>
            <Panel key="ticket-panel">
                <EmptyTicket />
            </Panel>
        </Panels>
    )
}

export default ViewLayout
