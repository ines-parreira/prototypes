import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router-dom'

import {PanelLayoutConfig} from 'pages/PanelLayout'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import DefaultViewFallback from 'split-ticket-view/components/DefaultViewFallback'
import TicketWrapper from 'split-ticket-view/components/TicketWrapper'
import {
    DEFAULT_INFOBAR_WIDTH,
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_TICKET_PANEL_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'

export default function useSplitTicketPage() {
    const match = useRouteMatch<{
        ticketId: string
        viewId: string
    }>('/app/views/:viewId/:ticketId')
    const viewId = match?.params.viewId
    const ticketId = match?.params.ticketId

    const config = useMemo(
        (): PanelLayoutConfig => [
            {
                key: 'navbar-panel',
                content: <TicketNavbar disableResize />,
                panelConfig: [DEFAULT_NAVBAR_WIDTH, 200, 350],
            },
            {
                key: `ticket-list-panel-${viewId || 'default'}`,
                content: (
                    <DefaultViewFallback ticketId={ticketId} viewId={viewId} />
                ),
                panelConfig: [
                    DEFAULT_TICKET_PANEL_WIDTH,
                    DEFAULT_TICKET_PANEL_WIDTH,
                    450,
                ],
            },
            {
                key: 'ticket-panel',
                content: <TicketWrapper isOnSplitTicketView />,
                panelConfig: [Infinity, 300],
            },
            {
                key: 'infobar-panel',
                content: <TicketInfobarContainer isOnNewLayout />,
                panelConfig: [
                    DEFAULT_INFOBAR_WIDTH,
                    DEFAULT_INFOBAR_WIDTH,
                    Math.max(
                        Math.round(window.innerWidth / 2),
                        DEFAULT_INFOBAR_WIDTH
                    ),
                ],
            },
        ],
        [ticketId, viewId]
    )

    return useMemo(() => ({config, layoutKey: LayoutKeys.TICKET}), [config])
}
