import React from 'react'

import {MOBILE_BREAKPOINT} from 'hooks/useIsMobileResolution/constants'
import App from 'pages/App'
import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {Config, Panel, Panels} from 'panels'

import TicketWrapper from 'split-ticket-view/components/TicketWrapper'
import {
    LayoutKeys,
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_INFOBAR_WIDTH,
} from 'split-ticket-view/constants'
import storePanelWidths from 'split-ticket-view/utils/storePanelWidths'
import createInitialConfig from 'split-ticket-view/utils/createInitialConfig'

const initialConfig = () => {
    const infobarMaxWidth = Math.round(window.innerWidth / 2)
    const config: Config = [
        [DEFAULT_NAVBAR_WIDTH, 200, 350],
        [Infinity, 300],
        [DEFAULT_INFOBAR_WIDTH, DEFAULT_INFOBAR_WIDTH, infobarMaxWidth],
    ]
    return createInitialConfig(LayoutKeys.FULL_TICKET, config)
}

const handleResize = (widths: number[]) => {
    storePanelWidths(LayoutKeys.FULL_TICKET, widths)
}

export default function TicketDetailLayout() {
    return (
        <Panels
            config={initialConfig()}
            fallbackComponent={
                <App
                    content={TicketDetailContainer}
                    navbar={TicketNavbar}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            }
            fallbackWidth={MOBILE_BREAKPOINT}
            onResize={handleResize}
        >
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
