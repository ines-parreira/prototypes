import { useState } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'

import { DEFAULT_SORT_OPTION } from '../../constants'
import { SortOption, TimelineItem } from '../../types'
import { sortTickets } from '../helpers/sortTickets'

export function useSort(tickets: TimelineItem[]) {
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
