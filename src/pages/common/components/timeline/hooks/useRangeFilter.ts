import { useState } from 'react'

import { TicketSummary } from '@gorgias/api-queries'

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
        setRangeFilter,
    }
}
