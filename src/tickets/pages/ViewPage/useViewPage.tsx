import React, { useMemo } from 'react'

import { globalNavigationPanel } from 'common/navigation'
import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import { useIsOnboardingHidden } from 'common/onboarding'
import { MOBILE_BREAKPOINT } from 'hooks/useIsMobileResolution/constants'
import App from 'pages/App'
import { PanelLayoutConfig } from 'pages/PanelLayout'
import OnboardingSidePanel from 'pages/tickets/list/OnboardingSidePanel'
import TicketList from 'pages/tickets/list/TicketList'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {
    DEFAULT_INFOBAR_WIDTH,
    DEFAULT_NAVBAR_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'

export default function useViewPage() {
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()

    const [isHidden, onHide] = useIsOnboardingHidden()

    const defaultConfig = useMemo(
        (): PanelLayoutConfig[] => [
            ...(showGlobalNav ? [globalNavigationPanel] : []),
            {
                key: 'navbar-panel',
                content: <TicketNavbar disableResize />,
                panelConfig: [DEFAULT_NAVBAR_WIDTH, 200, 350],
            },
            {
                key: 'ticket-list-panel',
                content: <TicketList />,
                panelConfig: [Infinity, 300],
            },
            {
                key: 'infobar-panel',
                content: (
                    <OnboardingSidePanel
                        isOnNewLayout
                        isHidden={isHidden}
                        onHide={onHide}
                    />
                ),
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
        [showGlobalNav, isHidden, onHide],
    )

    const config = useMemo(
        () =>
            isHidden
                ? defaultConfig.slice(0, showGlobalNav ? 3 : 2)
                : defaultConfig,
        [defaultConfig, showGlobalNav, isHidden],
    )

    return useMemo(
        () => ({
            config,
            fallbackComponent: (
                <App content={TicketList} navbar={TicketNavbar} />
            ),
            fallbackWidth: MOBILE_BREAKPOINT,
            layoutKey: LayoutKeys.FULL_TICKET,
        }),
        [config],
    )
}
