import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import {Config, Panel, Panels} from 'panels'

import storePanelWidths from '../utils/storePanelWidths'
import createInitialConfig from '../utils/createInitialConfig'
import {
    DEFAULT_INFOBAR_WIDTH,
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_TICKET_PANEL_WIDTH,
    LayoutKeys,
} from '../constants'
import DefaultViewFallback from './DefaultViewFallback'
import TicketWrapper from './TicketWrapper'
import css from './TicketLayout.less'

const initialConfig = () => {
    const infobarMaxWidth = Math.round(window.innerWidth / 2)
    const config: Config = [
        [DEFAULT_NAVBAR_WIDTH, 200, 350],
        [DEFAULT_TICKET_PANEL_WIDTH, DEFAULT_TICKET_PANEL_WIDTH, 450],
        [Infinity, 300],
        [DEFAULT_INFOBAR_WIDTH, DEFAULT_INFOBAR_WIDTH, infobarMaxWidth],
    ]
    return createInitialConfig(LayoutKeys.TICKET, config)
}

const handleResize = (widths: number[]) => {
    storePanelWidths(LayoutKeys.TICKET, widths)
}

type Params = {
    ticketId: string
    viewId: string
}

export default function TicketLayout({
    match: {
        params: {viewId, ticketId},
    },
}: RouteComponentProps<Params>) {
    return (
        <Panels config={initialConfig()} onResize={handleResize}>
            <Panel key="navbar-panel">
                <TicketNavbar disableResize />
            </Panel>
            <Panel key={`ticket-list-panel-${viewId || 'default'}`}>
                <DefaultViewFallback viewId={viewId} ticketId={ticketId} />
            </Panel>
            <Panel key="ticket-panel" className={css.container}>
                <TicketWrapper isOnSplitTicketView />
            </Panel>
            <Panel key="infobar-panel">
                <TicketInfobarContainer isOnNewLayout />
            </Panel>
        </Panels>
    )
}
