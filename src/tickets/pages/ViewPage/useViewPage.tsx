import React, {useMemo} from 'react'

import {useFlag} from 'common/flags'
import {globalNavigationPanel} from 'common/navigation'
import {useIsOnboardingHidden} from 'common/onboarding'
import {FeatureFlagKey} from 'config/featureFlags'
import {MOBILE_BREAKPOINT} from 'hooks/useIsMobileResolution/constants'
import App from 'pages/App'
import {PanelLayoutConfig} from 'pages/PanelLayout'
import OnboardingSidePanel from 'pages/tickets/list/OnboardingSidePanel'
import TicketList from 'pages/tickets/list/TicketList'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import {
    DEFAULT_NAVBAR_WIDTH,
    DEFAULT_INFOBAR_WIDTH,
    LayoutKeys,
} from 'split-ticket-view/constants'

export default function useViewPage() {
    const hasGlobalNav = useFlag<boolean>(
        FeatureFlagKey.GlobalNavigation,
        false
    )

    const [isHidden, onHide] = useIsOnboardingHidden()

    const defaultConfig = useMemo(
        (): PanelLayoutConfig[] => [
            ...(hasGlobalNav ? [globalNavigationPanel] : []),
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
                        DEFAULT_INFOBAR_WIDTH
                    ),
                ],
            },
        ],
        [hasGlobalNav, isHidden, onHide]
    )

    const config = useMemo(
        () =>
            isHidden
                ? defaultConfig.slice(0, hasGlobalNav ? 3 : 2)
                : defaultConfig,
        [defaultConfig, hasGlobalNav, isHidden]
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
        [config]
    )
}
