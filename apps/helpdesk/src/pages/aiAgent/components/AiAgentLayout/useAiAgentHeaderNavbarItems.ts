import { useRouteMatch } from 'react-router-dom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

export const useAiAgentHeaderNavbarItems = (shopName: string) => {
    const { navigationItems } = useAiAgentNavigation({ shopName })

    const match = useRouteMatch()

    const findNavigationItemRecursively = (
        items: typeof navigationItems,
        depth = 0,
        maxDepth = 5,
    ): (typeof navigationItems)[0] | undefined => {
        if (depth > maxDepth) {
            return undefined
        }

        for (const item of items) {
            const isMatch = item.exact
                ? match.url === item.route
                : match.url.startsWith(item.route)

            if (isMatch) {
                return item
            }

            if (item.items) {
                const found = findNavigationItemRecursively(
                    item.items,
                    depth + 1,
                    maxDepth,
                )
                if (found) {
                    return found
                }
            }
        }
        return undefined
    }

    const currentNavigationItem = findNavigationItemRecursively(navigationItems)

    return currentNavigationItem?.items
}
