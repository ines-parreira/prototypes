import {hasShopifyRequiredPermissions} from 'pages/aiAgent/utils/shopify-integration.utils'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'

export const useShopifyPermissionsData = ({
    storeName,
}: {
    storeName: string
}): {data?: ShopifyPermissionsData} => {
    const {integration} = useShopifyIntegrationAndScope(storeName)

    return {
        data: integration
            ? {
                  integrationId: integration.id,
                  hasRequiredPermissions:
                      hasShopifyRequiredPermissions(integration),
              }
            : undefined,
    }
}

export type ShopifyPermissionsData = {
    integrationId: number
    hasRequiredPermissions: boolean
}
