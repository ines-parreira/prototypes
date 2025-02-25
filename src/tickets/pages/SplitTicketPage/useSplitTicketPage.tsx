import React, { useMemo } from 'react'

import { useRouteMatch } from 'react-router-dom'

import { globalNavigationPanel } from 'common/navigation'
import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import { PanelLayoutConfig } from 'pages/PanelLayout'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import DefaultViewFallback from 'split-ticket-view/components/DefaultViewFallback'
import TicketWrapper from 'split-ticket-view/components/TicketWrapper'
import {
    DEFAULT_INFOBAR_WIDTH,
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_TICKET_PANEL_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'
import { useOnToggleUnread } from 'tickets/dtp'

export default function useSplitTicketPage() {
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()

    const match = useRouteMatch<{
        ticketId: string
        viewId: string
    }>('/app/views/:viewId/:ticketId')
    const viewId = match?.params.viewId
    const ticketId = match?.params.ticketId
    const { onToggleUnread, registerOnToggleUnread } = useOnToggleUnread()

    const config = useMemo(
        (): PanelLayoutConfig[] => [
            ...(showGlobalNav ? [globalNavigationPanel] : []),
            {
                key: 'navbar-panel',
                content: <TicketNavbar disableResize />,
                panelConfig: [DEFAULT_NAVBAR_WIDTH, 200, 350],
            },
            {
                key: `ticket-list-panel-${viewId || 'default'}`,
                content: (
                    <DefaultViewFallback
                        ticketId={ticketId}
                        viewId={viewId}
                        registerToggleUnread={registerOnToggleUnread}
                    />
                ),
                panelConfig: [
                    DEFAULT_TICKET_PANEL_WIDTH,
                    DEFAULT_TICKET_PANEL_WIDTH,
                    450,
                ],
            },
            {
                key: 'ticket-panel',
                content: (
                    <TicketWrapper
                        isOnSplitTicketView
                        onToggleUnread={onToggleUnread}
                    />
                ),
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
                        DEFAULT_INFOBAR_WIDTH,
                    ),
                ],
            },
        ],
        [
            showGlobalNav,
            ticketId,
            viewId,
            onToggleUnread,
            registerOnToggleUnread,
        ],
    )

    return useMemo(() => ({ config, layoutKey: LayoutKeys.TICKET }), [config])
}
