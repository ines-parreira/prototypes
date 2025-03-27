import { useState } from 'react'

import { TicketSummary } from '@gorgias/api-queries'

import { DEFAULT_SORT_OPTION } from '../constants'
import { sortTickets } from '../helpers/sortTickets'
import { SortOption } from '../types'

export function useSort(tickets: TicketSummary[]) {
    const [sortOption, setSortOption] =
        useState<SortOption>(DEFAULT_SORT_OPTION)

    const sortedTickets = sortTickets(tickets, sortOption)

    return {
        sortedTickets,
        sortOption,
        setSortOption,
    }
}
