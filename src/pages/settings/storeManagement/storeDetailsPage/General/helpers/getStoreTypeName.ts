import { IntegrationType, StoreIntegration } from 'models/integration/types'

export default function getStoreTypeName(
    integration?: StoreIntegration | null,
) {
    if (integration?.type === IntegrationType.Shopify) {
        return 'Shopify'
    }
    if (integration?.type === IntegrationType.Magento2) {
        return 'Magento 2'
    }
    if (integration?.type === IntegrationType.BigCommerce) {
        return 'BigCommerce'
    }
    return ''
}
