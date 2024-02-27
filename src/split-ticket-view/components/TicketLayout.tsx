import React from 'react'
import {RouteComponentProps} from 'react-router-dom'

import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import {Config, Panel, Panels} from 'panels'

import storePanelWidths from '../utils/storePanelWidths'
import createInitialConfig from '../utils/createInitialConfig'
import {LayoutKeys} from '../constants'
import DefaultViewFallback from './DefaultViewFallback'
import TicketWrapper from './TicketWrapper'
import css from './TicketLayout.less'

const defaultPanelsConfig: Config = [
    [238, 200, 350],
    [300, 300, 450],
    [Infinity, 300],
    [Infinity, 340, 400],
]

const initialConfig = () =>
    createInitialConfig(LayoutKeys.TICKET, defaultPanelsConfig)

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
            <Panel key="ticket-list-panel">
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
