import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {globalNavigationPanel} from 'common/navigation'
import {FeatureFlagKey} from 'config/featureFlags'
import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'
import {PanelLayoutConfig} from 'pages/PanelLayout'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import DefaultViewFallback from 'split-ticket-view/components/DefaultViewFallback'
import {
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_TICKET_PANEL_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'
import {EmptyTicket} from 'ticket-page'

export default function useSplitViewPage() {
    const hasGlobalNav = useFlag<boolean>(
        FeatureFlagKey.GlobalNavigation,
        false
    )
    const isMobileResolution = useIsMobileResolution()
    const showGlobalNav = hasGlobalNav && !isMobileResolution

    const match = useRouteMatch<{viewId?: string}>('/app/views/:viewId?')
    const viewId = match?.params.viewId

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
                content: <DefaultViewFallback viewId={viewId} />,
                panelConfig: [
                    DEFAULT_TICKET_PANEL_WIDTH,
                    DEFAULT_TICKET_PANEL_WIDTH,
                    450,
                ],
            },
            {
                key: 'ticket-panel',
                content: <EmptyTicket />,
                panelConfig: [Infinity, 100, Infinity],
            },
        ],
        [showGlobalNav, viewId]
    )

    return useMemo(() => ({config, layoutKey: LayoutKeys.VIEW}), [config])
}
