import { IdentifierCategoryKey } from 'models/rule/types'
import type { SupportedCategories } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/types'

export const METAFIELD_CATEGORY_KEYS = [
    IdentifierCategoryKey.ShopifyCustomerMetafields,
    IdentifierCategoryKey.ShopifyLastOrderMetafields,
    IdentifierCategoryKey.ShopifyLastDraftOrderMetafields,
] as const

export const SHOPIFY_STORES_PATH_PREFIX =
    'ticket.customer.integrations.shopify.stores'

export const INTEGRATION_ID_REGEX = /integrations\.shopify\.stores\.(\d+)\./

export const METAFIELD_CATEGORY_PATTERNS = {
    Customer: /integrations\.shopify\.stores\.\d+\.customer\.metafields/,
    Order: /integrations\.shopify\.stores\.\d+\.last_order\.metafields/,
    DraftOrder:
        /integrations\.shopify\.stores\.\d+\.last_draft_order\.metafields/,
} as const

export const METAFIELD_ENTITY_PATHS = {
    Customer: 'customer.metafields',
    Order: 'last_order.metafields',
    DraftOrder: 'last_draft_order.metafields',
} as const

export function buildMetafieldBasePath(
    integrationId: number,
    category: SupportedCategories,
): string {
    return `${SHOPIFY_STORES_PATH_PREFIX}.${integrationId}.${METAFIELD_ENTITY_PATHS[category]}`
}

export const NESTED_VALUE_METAFIELD_TYPES = [
    'rating',
    'dimension',
    'volume',
    'weight',
]
