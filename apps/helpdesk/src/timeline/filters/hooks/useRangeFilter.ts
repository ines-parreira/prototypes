import { useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import type { Range, TimelineItem } from '../../types'
import { filterTicketsByRange } from '../helpers/rangeFilter'

export function useRangeFilter(tickets: TimelineItem[]) {
    const [rangeFilter, setRangeFilter] = useState<Range>({
        start: null,
        end: null,
    })

    const rangeFilteredTickets = filterTicketsByRange(tickets, rangeFilter)

    return {
        rangeFilter,
        rangeFilteredTickets,
        setRangeFilter: (range: Range) => {
            setRangeFilter(range)
            logEvent(SegmentEvent.CustomerTimelineFilter, {
                account_id: window.GORGIAS_STATE.currentAccount.id,
                action: 'date-range-changed',
            })
        },
    }
}
