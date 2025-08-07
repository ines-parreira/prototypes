import { DateTimeResultFormatType } from 'constants/datetime'
import { formatDatetime } from 'utils'

import * as timelineItem from '../../helpers/timelineItem'
import { Range, TimelineItem } from '../../types'

export function filterTicketsByRange(tickets: TimelineItem[], range: Range) {
    return tickets.filter((ticket) => {
        const ticketDate = timelineItem.getCreatedDate(ticket).getTime()
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
