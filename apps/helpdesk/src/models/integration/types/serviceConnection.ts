export type ServiceConnectionStatus = 'active' | 'invalid'

export type ServiceConnectionAuthType =
    | 'basic'
    | 'bearer-token'
    | 'oauth2'
    | 'api-key'
    | 'custom-scheme'

export type ServiceConnectionAuthLocation = 'header' | 'query'

export type ServiceConnectionVendor = 'trackstar'

export type ServiceConnectionApiDTO = {
    id: string
    name: string
    service: string
    url: string
    status: ServiceConnectionStatus
    created_datetime: string
    updated_datetime: string | null
    trashed_datetime: string | null
    created_by: number
    updated_by: number | null
    trashed_by: number | null
    external_id: string | null
    vendor: ServiceConnectionVendor | null
}

export type ServiceConnectionAuthApiDTO = {
    type: ServiceConnectionAuthType
    location: ServiceConnectionAuthLocation
    key: string
    value: string
    scheme?: string | null
    expiration_datetime?: string | null
}

export type StoreForServiceConnectionApiDTO = {
    service_connection_id: string
    store_id: number
    store_type: string
    store_name: string | null
    created_datetime: string
    updated_datetime: string
}

export type UpdateServiceConnectionAuthRequest = {
    type: ServiceConnectionAuthType
    location: ServiceConnectionAuthLocation
    key: string
    value?: string | null
    scheme?: string | null
    client_secret?: string | null
    token_url?: string | null
    client_id?: string | null
    scopes?: string | null
}

export type UpdateServiceConnectionRequest = {
    name?: string
    url?: string
    auth?: UpdateServiceConnectionAuthRequest
}

export type CreateServiceConnectionAuthRequest = {
    type: ServiceConnectionAuthType
    location: ServiceConnectionAuthLocation
    key: string
    value: string
    scheme?: string | null
}

export type CreateServiceConnectionRequest = {
    name: string
    service: string
    url: string
    auth: CreateServiceConnectionAuthRequest
    application_id?: string | null
    external_id?: string | null
    vendor?: ServiceConnectionVendor | null
}
