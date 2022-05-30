import {CancelToken} from 'axios'

import {ApiListResponse} from 'models/api/types'

export enum SearchType {
    Agent = 'agent',
    Customer = 'customer',
    CustomerProfile = 'customer_profile',
    CustomerChannel = 'customer_channel',
    CustomerChannelEmail = 'customer_channel_email',
    CustomerChannelPhone = 'customer_channel_phone',
    CustomersByPhone = 'customers_by_phone',
    UserProfile = 'user_profile',
    Integration = 'integration',
    UserChannelEmail = 'user_channel_email',
    UserChannelPhone = 'user_channel_phone',
    Team = 'team',
    Tag = 'tag',
}

export type SearchParams = {
    query: string
    type: SearchType
    cancelToken?: CancelToken
}

export enum SearchEngine {
    PG = 'PG',
    ES = 'ES',
}

export type SearchApiResponse<T> = ApiListResponse<T[], Record<string, unknown>>

export type SearchResponse<T> = SearchApiResponse<T> & {
    searchEngine?: SearchEngine
}

export type UserSearchResult = {
    address: string
    customer: {
        id: number
        name: string
    }
    id: number
    user?: {
        id: number
        name: string
    }
}
