import {IntegrationType} from 'models/integration/constants'

export const ALLOWED_INTEGRATION_TYPES = [
    IntegrationType.Shopify,
    IntegrationType.BigCommerce,
    IntegrationType.Magento2,
    IntegrationType.Ecommerce, // contains WooCommerce
    IntegrationType.GorgiasChat,
]
