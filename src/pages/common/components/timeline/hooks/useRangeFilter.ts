import { useState } from 'react'

import { TicketSummary } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'

import { filterTicketsByRange } from '../helpers/rangeFilter'
import { Range } from '../types'

export function useRangeFilter(tickets: TicketSummary[]) {
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
