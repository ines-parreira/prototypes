import React, {useMemo} from 'react'

import {useFlag} from 'common/flags'
import {globalNavigationPanel} from 'common/navigation'
import {FeatureFlagKey} from 'config/featureFlags'
import {MOBILE_BREAKPOINT} from 'hooks/useIsMobileResolution/constants'
import App from 'pages/App'
import {PanelLayoutConfig} from 'pages/PanelLayout'
import TicketDetailContainer from 'pages/tickets/detail/TicketDetailContainer'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import TicketWrapper from 'split-ticket-view/components/TicketWrapper'
import {
    DEFAULT_INFOBAR_WIDTH,
    DEFAULT_NAVBAR_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'

export default function useTicketpage() {
    const hasGlobalNav = useFlag<boolean>(
        FeatureFlagKey.GlobalNavigation,
        false
    )

    const config = useMemo(
        (): PanelLayoutConfig[] => [
            ...(hasGlobalNav ? [globalNavigationPanel] : []),
            {
                key: 'navbar-panel',
                content: <TicketNavbar disableResize />,
                panelConfig: [DEFAULT_NAVBAR_WIDTH, 200, 350],
            },
            {
                key: 'ticket-panel',
                content: <TicketWrapper />,
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
        [hasGlobalNav]
    )

    return useMemo(
        () => ({
            config,
            fallbackComponent: (
                <App
                    content={TicketDetailContainer}
                    navbar={TicketNavbar}
                    infobar={TicketInfobarContainer}
                    infobarOnMobile={true}
                />
            ),
            fallbackWidth: MOBILE_BREAKPOINT,
            layoutKey: LayoutKeys.FULL_TICKET,
        }),
        [config]
    )
}
