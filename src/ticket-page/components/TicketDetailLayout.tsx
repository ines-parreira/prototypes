import React from 'react'

import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'

import TicketWrapper from 'split-ticket-view/components/TicketWrapper'
import {LayoutKeys} from 'split-ticket-view/constants'
import storePanelWidths from 'split-ticket-view/utils/storePanelWidths'
import createInitialConfig from 'split-ticket-view/utils/createInitialConfig'

const defaultPanelsConfig: Config = [
    [238, 200, 350],
    [Infinity, 300],
    [Infinity, 340, 400],
]

const initialConfig = () =>
    createInitialConfig(LayoutKeys.TICKET, defaultPanelsConfig)

const handleResize = (widths: number[]) => {
    storePanelWidths(LayoutKeys.TICKET, widths)
}

export default function TicketDetailLayout() {
    return (
        <Panels config={initialConfig()} onResize={handleResize}>
            <Panel key="navbar-panel">
                <TicketNavbar disableResize />
            </Panel>
            <Panel key="ticket-panel">
                <TicketWrapper />
            </Panel>
            <Panel key="infobar-panel">
                <TicketInfobarContainer isOnNewLayout />
            </Panel>
        </Panels>
    )
}
