import moment from 'moment'

import { Order } from 'constants/integrations/types/shopify'

import {
    FilterKey,
    InteractionFilterType,
    SortableKey,
    SortOption,
} from './types'

export const TIMELINE_SEARCH_PARAM = 'timelineShopperId'

export const TICKET_FETCH_STALE_TIME = 1000 * 60 * 10 // 10 minutes
export const TICKET_FETCHED_LIMIT = 100

export const MIN_RANGE_DATE = moment(new Date('2015-01-01'))
    .startOf('day')
    .toDate()

export const END_OF_TODAY_DATE = moment().endOf('day').toDate()

export const STATUS_FILTERS: {
    value: FilterKey
    label: string
}[] = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'snooze', label: 'Snoozed' },
]

export const INTERACTION_FILTER_OPTIONS: {
    value: InteractionFilterType
    label: string
}[] = [
    { value: 'ticket', label: 'Tickets' },
    { value: 'order', label: 'Orders' },
]

export const SORTABLE_KEYS = [
    'last_message_datetime',
    'last_received_message_datetime',
    'created_datetime',
    'updated_datetime',
] as const

export const SORTABLE_KEY_TO_LABEL = {
    last_message_datetime: 'Last message' as const,
    last_received_message_datetime: 'Last received message' as const,
    created_datetime: 'Created' as const,
    updated_datetime: 'Last updated' as const,
} satisfies Record<SortableKey, unknown>

export const DEFAULT_SORT_OPTION: SortOption = {
    key: 'last_message_datetime',
    order: 'desc',
    label: SORTABLE_KEY_TO_LABEL['last_message_datetime'],
}

// We need to keep DEFAULT_SORT_OPTION object’s reference for the it to be
// preselected in the select field
export const SORT_OPTIONS: SortOption[] = [
    {
        key: 'last_message_datetime',
        order: 'asc',
        label: SORTABLE_KEY_TO_LABEL['last_message_datetime'],
    },
    DEFAULT_SORT_OPTION,
    {
        key: 'last_received_message_datetime',
        order: 'asc',
        label: SORTABLE_KEY_TO_LABEL['last_received_message_datetime'],
    },
    {
        key: 'last_received_message_datetime',
        order: 'desc',
        label: SORTABLE_KEY_TO_LABEL['last_received_message_datetime'],
    },
    {
        key: 'created_datetime',
        order: 'asc',
        label: SORTABLE_KEY_TO_LABEL['created_datetime'],
    },
    {
        key: 'created_datetime',
        order: 'desc',
        label: SORTABLE_KEY_TO_LABEL['created_datetime'],
    },
]

export const SORT_OPTIONS_WITH_ORDERS: SortOption[] = [
    {
        key: 'updated_datetime',
        order: 'asc',
        label: SORTABLE_KEY_TO_LABEL['updated_datetime'],
    },
    {
        key: 'updated_datetime',
        order: 'desc',
        label: SORTABLE_KEY_TO_LABEL['updated_datetime'],
    },
    {
        key: 'created_datetime',
        order: 'asc',
        label: SORTABLE_KEY_TO_LABEL['created_datetime'],
    },
    {
        key: 'created_datetime',
        order: 'desc',
        label: SORTABLE_KEY_TO_LABEL['created_datetime'],
    },
]

export const SORTABLE_KEY_TO_ORDER_KEY: Record<SortableKey, keyof Order> = {
    created_datetime: 'created_at',
    last_message_datetime: 'updated_at',
    last_received_message_datetime: 'updated_at',
    updated_datetime: 'updated_at',
}

export const ALL_FILTERS = ['All']
