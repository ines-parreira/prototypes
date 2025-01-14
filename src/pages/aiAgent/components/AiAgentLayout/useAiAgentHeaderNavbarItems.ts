import {useRouteMatch} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

export const useAiAgentHeaderNavbarItems = (shopName: string) => {
    const isStandaloneMenuEnabled = useFlag(
        FeatureFlagKey.ConvAiStandaloneMenu,
        false
    )

    const {navigationItems} = useAiAgentNavigation({shopName})

    const match = useRouteMatch()
    const currentNavigationItem = navigationItems.find((x) =>
        x.exact ? match.url === x.route : match.url.startsWith(x.route)
    )

    return isStandaloneMenuEnabled
        ? currentNavigationItem?.items
        : navigationItems
}
