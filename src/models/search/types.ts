import {
    SearchVoiceCalls200DataItemHighlights,
    SearchVoiceCallsParams,
} from '@gorgias/api-types'
import {CancelToken} from 'axios'
import {isObject} from 'lodash'

import {
    ApiListResponse,
    ApiPaginationParams,
    OrderParams,
} from 'models/api/types'
import {Customer} from 'models/customer/types'
import {Ticket} from 'models/ticket/types'
import {VoiceCall} from 'models/voiceCall/types'

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

export const pickedTicketFields = [
    'id',
    'channel',
    'status',
    'subject',
    'excerpt',
    'assignee_user',
    'created_datetime',
] as const
export type PickedTicket = Pick<Ticket, (typeof pickedTicketFields)[number]> & {
    customer: Pick<Customer, 'id' | 'name' | 'email'>
}
export const isTicket = (
    item:
        | PickedTicket
        | PickedTicketWithHighlights
        | PickedCustomer
        | PickedCustomerWithHighlights
        | PicketVoiceCallWithHighlights
): item is PickedTicketWithHighlights => {
    return 'channel' in item
}

//
// TODO: @anddon move this to the SDK

export const isUserSearchResult = (
    input: unknown
): input is UserSearchResult => {
    return (
        isObject(input) &&
        'id' in input &&
        'address' in input &&
        'customer' in input &&
        isObject(input.customer) &&
        'id' in input.customer &&
        'name' in input.customer &&
        typeof input.id === 'number' &&
        typeof input.address === 'string' &&
        typeof input.customer.id === 'number' &&
        typeof input.customer.name === 'string'
    )
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

export enum TicketSearchSortableProperties {
    UpdatedDatetime = 'updated_datetime',
    CreatedDatetime = 'created_datetime',
    LastMessageDatetime = 'last_message_datetime',
    LastReceivedMessageDatetime = 'last_received_message_datetime',
    ClosedDatetime = 'closed_datetime',
    SnoozeDatetime = 'snooze_datetime',
}

export const pickedCustomerFields = ['email', 'id', 'name', 'channels'] as const
export type PickedCustomer = Pick<
    Customer,
    (typeof pickedCustomerFields)[number]
>

export type PickedCustomerWithHighlights = PickedCustomer & {
    highlights?: CustomerHighlights
}

export type PickedTicketWithHighlights = PickedTicket & {
    highlights?: TicketHighlights
}

export const isCustomer = (
    item:
        | PickedTicket
        | PickedTicketWithHighlights
        | PickedCustomer
        | PickedCustomerWithHighlights
        | PicketVoiceCallWithHighlights
): item is PickedCustomerWithHighlights => {
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

export const CUSTOMER_SEARCH_ORDERING = '_score:desc' as const

export type CustomerSearchOptions = ApiPaginationParams & {
    orderBy?: typeof CUSTOMER_SEARCH_ORDERING | undefined
} & {
    search: string
    cancelToken?: CancelToken
    withHighlights?: boolean
}

export type VoiceCallWithHighlightsResponse = {
    entity: VoiceCall
    highlights: SearchVoiceCalls200DataItemHighlights
}

export type PicketVoiceCallWithHighlights = VoiceCall & {
    highlights?: SearchVoiceCalls200DataItemHighlights
}

export type VoiceCallSearchOptions = SearchVoiceCallsParams & {
    search?: string
    cancelToken?: CancelToken
    withHighlights?: boolean
}
