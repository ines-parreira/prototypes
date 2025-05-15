import { useRouteMatch } from 'react-router-dom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export const useAiAgentHeaderNavbarItems = (shopName: string) => {
    const { navigationItems } = useAiAgentNavigation({ shopName })

    const match = useRouteMatch()
    const currentNavigationItem = navigationItems.find((item) =>
        item.exact
            ? match.url === item.route
            : match.url.startsWith(item.route),
    )

    return currentNavigationItem?.items
}
