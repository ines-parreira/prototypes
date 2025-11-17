import { useLocation } from 'react-router'

import type { ShopifyIntegration } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentOverviewModeEnabled } from 'pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

type Props = {
    shopName: string
    shopType: string
}

export const useDisplayPlaygroundButtonInLayoutHeader = ({
    shopName,
    shopType,
}: Props) => {
    const location = useLocation()
    const currentPath = location.pathname

    const { isAiAgentLiveModeEnabled } = useAiAgentOverviewModeEnabled(
        shopName,
        shopType,
        true, // shopName and shopType are always available.
    )

    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName ?? ''),
    ).toJS()

    const storeOnboardingCompleted =
        !!shopName && Object.keys(storeIntegration).length > 0

    const isOnTestPage =
        currentPath.includes('/ai-agent') && currentPath.includes('/test')

    const isOnOpportunitiesPage = currentPath.includes('/opportunities')

    const isOnOverviewPage = currentPath.endsWith('/overview')

    const isOnSettingsPage = currentPath.endsWith('/settings')

    if (isOnOverviewPage) {
        return isAiAgentLiveModeEnabled
    }

    const isButtonEnabled =
        storeOnboardingCompleted &&
        !isOnTestPage &&
        !isOnOpportunitiesPage &&
        !isOnSettingsPage

    return isButtonEnabled
}
