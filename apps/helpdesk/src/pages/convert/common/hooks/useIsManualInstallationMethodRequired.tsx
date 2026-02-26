import { useMemo } from 'react'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import type {
    GorgiasChatIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import { GorgiasChatInstallationMethod } from 'models/integration/types'
import useGetChatInstallationStatus from 'pages/convert/common/hooks/useGetChatInstallationStatus'
import useShopifyThemeAppExtension from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShopifyThemeAppExtension'
import { getGorgiasMainThemeAppExtensionId } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'

const useIsManualInstallationMethodRequired = (
    chatIntegration: GorgiasChatIntegration | undefined,
    storeIntegration: ShopifyIntegration | undefined,
) => {
    const { installed: chatInstalled, method: chatInstallationMethod } =
        useGetChatInstallationStatus(chatIntegration)

    const { isInstalled } = useShopifyThemeAppExtension({
        shopifyIntegration: storeIntegration,
        appUuid: getGorgiasMainThemeAppExtensionId(),
    })

    const isConnectedToShopify = useMemo(
        () =>
            Boolean(
                storeIntegration &&
                    storeIntegration.type === SHOPIFY_INTEGRATION_TYPE,
            ),
        [storeIntegration],
    )

    return (
        !isConnectedToShopify ||
        !chatInstalled ||
        chatInstallationMethod === null ||
        (chatInstallationMethod ===
            GorgiasChatInstallationMethod.ThemeAppExtension &&
            !isInstalled)
    )
}

export default useIsManualInstallationMethodRequired
