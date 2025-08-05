import { useState } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'

import { filterTicketsByRange } from '../helpers/rangeFilter'
import { Range, TimelineItem } from '../types'

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
