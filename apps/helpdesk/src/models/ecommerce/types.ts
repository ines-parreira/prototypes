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
