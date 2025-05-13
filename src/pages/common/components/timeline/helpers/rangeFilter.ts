import { TicketSummary } from '@gorgias/api-queries'

import { DateTimeResultFormatType } from 'constants/datetime'
import { formatDatetime } from 'utils'

import { Range } from '../types'

export function filterTicketsByRange(tickets: TicketSummary[], range: Range) {
    return tickets.filter((ticket) => {
        const ticketDate = new Date(ticket.created_datetime).getTime()
        return (
            ticketDate >= (range.start || 0) &&
            ticketDate <= (range.end || Date.now())
        )
    })
}

export const getRangeLabel = (
    range: Range,
    labelDateFormat: DateTimeResultFormatType,
) => {
    if (!range.start || !range.end) {
        return 'All time'
    }
    const start = formatDatetime(range.start / 1000, labelDateFormat).toString()
    const end = formatDatetime(range.end / 1000, labelDateFormat).toString()

    if (start === end) {
        return start
    }

    return `${start} - ${end}`
}
