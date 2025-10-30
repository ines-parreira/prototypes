export type LookupValue = {
    id: string
    account_id: number
    integration_id: number
    source_type: string
    lookup_type: string
    created_datetime: string
    value: string
}

export type Product = {
    external_id: string
    data: {
        title: string
        status: string
        vendor?: string
        tags?: string[]
        featuredMedia?: {
            image?: {
                url: string
            }
        }
    }
}

export type ProductCollection = {
    id: string
    account_id: number
    deleted_datetime: string | null
    created_datetime: string
    updated_datetime: string
    data: {
        legacyResourceId: string
        title: string
        handle: string
        updatedAt: string
        descriptionHtml: string
        sortOrder: string
        templateSuffix: string | null
        id: string
    }
    source_type: string
    integration_id: number
    external_id: string
    relationships: Record<string, unknown>
    version: string
    schema_version: string
    indexed_data_fields: {
        product_external_ids: string[]
    }
}

export type ProductAdditionalInfo = {
    rich_text: string
}

export type ProductAdditionalInfoPayload = {
    data: ProductAdditionalInfo
    version: string
}

export enum AdditionalInfoObjectType {
    ANONYMOUS_CART = 'anonymous_cart',
    ANONYMOUS_CHECKOUT = 'anonymous_checkout',
    CART = 'cart',
    CHARGE = 'charge',
    CHECKOUT = 'checkout',
    CREDIT_MEMO = 'credit_memo',
    DRAFT_ORDER = 'draft_order',
    EMAIL_MARKETING_CONSENT = 'email_marketing_consent',
    FULFILLMENT_EVENT = 'fulfillment_event',
    INVENTORY_ITEM = 'inventory_item',
    MARKETING_CONSENT = 'marketing_consent',
    ORDER = 'order',
    PRODUCT = 'product',
    PRODUCT_COLLECTION = 'product_collection',
    PURCHASE_SUMMARY = 'purchase_summary',
    REVIEW = 'review',
    SHIPMENT = 'shipment',
    SHOPPER = 'shopper',
    SUBSCRIPTION = 'subscription',
}

export enum AdditionalInfoSourceType {
    BIGCOMMERCE = 'bigcommerce',
    MAGENTO = 'magento',
    RECHARGE = 'recharge',
    SHOPIFY = 'shopify',
    SMILE = 'smile',
    WOOCOMMERCE = 'woocommerce',
    YOTPO = 'yotpo',
}

export enum AdditionalInfoKey {
    AI_AGENT_EXTENDED_CONTEXT = 'ai_agent_extended_context',
}
