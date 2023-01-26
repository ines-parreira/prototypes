import {
    BigCommerceIntegration,
    IntegrationType,
    Magento2Integration,
    ShopifyIntegration,
} from 'models/integration/types'

export const getShopNameFromStoreIntegration = (
    integration:
        | ShopifyIntegration
        | Magento2Integration
        | BigCommerceIntegration
) => {
    switch (integration.type) {
        case IntegrationType.BigCommerce:
            return integration.meta.store_hash
        case IntegrationType.Magento2:
            return integration.meta.store_url
        case IntegrationType.Shopify:
            return integration.meta.shop_name
    }
}
