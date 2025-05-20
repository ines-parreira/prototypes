import { IntegrationType } from 'models/integration/constants'
import { StoreIntegration } from 'models/integration/types'

export default function getStoreDomain(store: StoreIntegration) {
    switch (store.type) {
        case IntegrationType.Magento2:
            return store.meta?.store_url
        case IntegrationType.Shopify:
        case IntegrationType.BigCommerce:
            return store.meta?.shop_domain
        default:
            return null
    }
}
