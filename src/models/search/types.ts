import {CancelToken} from 'axios'

import {
    ApiListResponse,
    ApiPaginationParams,
    OrderParams,
} from 'models/api/types'
import {Customer, CustomerSortableProperties} from 'models/customer/types'
import {PickedTicket} from 'pages/common/components/Spotlight/SpotlightTicketRow'

export enum SearchType {
    Agent = 'agent',
    Customer = 'customer',
    CustomerProfile = 'customer_profile',
    CustomerChannel = 'customer_channel',
    CustomerChannelEmail = 'customer_channel_email',
    CustomerChannelPhone = 'customer_channel_phone',
    CustomersByPhone = 'customers_by_phone',
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
    GCP_ES = 'GCP_ES',
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
export type TicketSearchOptions = ApiPaginationParams &
    OrderParams<TicketSearchSortableProperties> & {
        search?: string
        filters?: string
        cancelToken?: CancelToken
        withHighlights?: boolean
    }

export const isTicketWithHighlights = (
    item:
        | PickedTicket
        | TicketWithHighlights
        | PickedCustomer
        | CustomerWithHighlights
): item is TicketWithHighlights => {
    return 'type' in item && item.type === 'Ticket'
}
export const isTicket = (
    item:
        | PickedTicket
        | TicketWithHighlights
        | PickedCustomer
        | CustomerWithHighlights
): item is PickedTicket => {
    return 'channel' in item
}
export type TicketHighlights = {
    id?: string[]
    subject?: string[]
    messages?: {
        body?: string[]
        from?: {
            name?: string[]
            address?: string[]
        }
        to?: {
            name?: string[]
            address?: string[]
        }
    }
}
export type TicketWithHighlightsResponse = {
    entity: PickedTicket
    highlights: TicketHighlights
}

export type TicketWithHighlights = {
    type: 'Ticket'
    entity: PickedTicket
    highlights: TicketHighlights
}

export enum TicketSearchSortableProperties {
    UpdatedDatetime = 'updated_datetime',
    CreatedDatetime = 'created_datetime',
    LastMessageDatetime = 'last_message_datetime',
    LastReceivedMessageDatetime = 'last_received_message_datetime',
    ClosedDatetime = 'closed_datetime',
    SnoozeDatetime = 'snooze_datetime',
}

export const pickedCustomerFields = ['email', 'id', 'name', 'channels'] as const
export type PickedCustomer = Pick<Customer, typeof pickedCustomerFields[number]>

export const isCustomerWithHighlights = (
    item:
        | PickedTicket
        | TicketWithHighlights
        | PickedCustomer
        | CustomerWithHighlights
): item is CustomerWithHighlights => {
    return 'type' in item && item.type === 'Customer'
}

export const isCustomer = (
    item:
        | PickedTicket
        | TicketWithHighlights
        | PickedCustomer
        | CustomerWithHighlights
): item is Customer => {
    return 'email' in item
}

export type CustomerHighlights = {
    channels?: {address?: string[]}
    name?: string[]
    email?: string[]
    order_ids?: string[]
}

export type CustomerWithHighlightsResponse = {
    entity: Customer
    highlights: CustomerHighlights
}

export type CustomerWithHighlights = {
    type: 'Customer'
    entity: Customer
    highlights: CustomerHighlights
}

export type CustomerSearchOptions = ApiPaginationParams &
    OrderParams<CustomerSortableProperties> & {
        search: string
        cancelToken?: CancelToken
        withHighlights?: boolean
    }
