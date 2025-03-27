import { TicketSummary } from '@gorgias/api-types'

import { FALLBACK_SORT_KEY } from '../constants'
import { SortOption } from '../types'

export function sortTickets(tickets: TicketSummary[], sortOption: SortOption) {
    return [...tickets].sort((a, b) => {
        const aField = new Date(
            a[sortOption.key] || (b[FALLBACK_SORT_KEY] as string),
        ).getTime()
        const bField = new Date(
            b[sortOption.key] || (b[FALLBACK_SORT_KEY] as string),
        ).getTime()

        if (sortOption.order === 'asc') {
            return aField - bField
        }
        return bField - aField
    })
}
