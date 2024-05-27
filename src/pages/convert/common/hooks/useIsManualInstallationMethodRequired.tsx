import {useMemo} from 'react'
import {
    GorgiasChatIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import useGetChatInstallationStatus from 'pages/convert/common/hooks/useGetChatInstallationStatus'
import {SHOPIFY_INTEGRATION_TYPE} from 'constants/integration'

const useIsManualInstallationMethodRequired = (
    chatIntegration: GorgiasChatIntegration | undefined,
    storeIntegration: ShopifyIntegration | undefined
) => {
    const {installed: chatInstalled, method: chatInstallationMethod} =
        useGetChatInstallationStatus(chatIntegration)

    const isConnectedToShopify = useMemo(
        () =>
            Boolean(
                storeIntegration &&
                    storeIntegration.type === SHOPIFY_INTEGRATION_TYPE
            ),
        [storeIntegration]
    )

    return (
        !isConnectedToShopify ||
        !chatInstalled ||
        chatInstallationMethod === null
    )
}

export default useIsManualInstallationMethodRequired
