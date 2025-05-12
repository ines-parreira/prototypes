import { useState } from 'react'

import { TicketSummary } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'

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
        setSortOption: (option: SortOption) => {
            setSortOption(option)
            logEvent(SegmentEvent.CustomerTimelineSort, {
                account_id: window.GORGIAS_STATE.currentAccount.id,
                option: `${option.key}_${option.order}`,
            })
        },
    }
}
