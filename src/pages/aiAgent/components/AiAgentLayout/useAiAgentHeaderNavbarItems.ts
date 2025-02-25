import { useRouteMatch } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export const useAiAgentHeaderNavbarItems = (shopName: string) => {
    const isStandaloneMenuEnabled = useFlag(FeatureFlagKey.ConvAiStandaloneMenu)

    const { navigationItems } = useAiAgentNavigation({ shopName })

    const match = useRouteMatch()
    const currentNavigationItem = navigationItems.find((item) =>
        item.exact
            ? match.url === item.route
            : match.url.startsWith(item.route),
    )

    return isStandaloneMenuEnabled
        ? currentNavigationItem?.items
        : navigationItems
}
