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
        featuredMedia?: {
            image?: {
                url: string
            }
        }
    }
}
