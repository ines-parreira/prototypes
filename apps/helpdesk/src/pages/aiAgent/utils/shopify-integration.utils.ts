import type { ShopifyIntegration } from 'models/integration/types'

export const READ_FULFILLMENTS_PERMISSION = 'read_fulfillments'

export const hasShopifyRequiredPermissions = (
    integration: ShopifyIntegration,
) => integration.meta.oauth.scope.includes(READ_FULFILLMENTS_PERMISSION)
