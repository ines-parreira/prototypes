import { TicketStatus } from '@gorgias/api-queries'
import { TicketSummary } from '@gorgias/api-types'

import { SORTABLE_KEY_TO_LABEL, SORTABLE_KEYS } from './constants'

export type ReduxCustomerHistory = {
    triedLoading: boolean
    hasHistory: boolean
    // It’s not exactly that type yet but it’s a start
    tickets: TicketSummary[]
}

export type Range = {
    start: number | null
    end: number | null
}

export type FilterKey = TicketStatus | 'snooze'

export type SortType = 'asc' | 'desc'
export type SortableKey = (typeof SORTABLE_KEYS)[number]

export type SortOption = {
    order: SortType
    key: SortableKey
    label: (typeof SORTABLE_KEY_TO_LABEL)[SortableKey]
}
