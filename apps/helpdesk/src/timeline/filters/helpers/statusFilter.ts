import { toTicket } from 'timeline/helpers/timelineItem'

import { ALL_FILTERS, STATUS_FILTERS } from '../../constants'
import { FilterKey, TimelineItem } from '../../types'

export function getOptionLabels(selectedStatus: FilterKey[]): string[] {
    return selectedStatus.length === STATUS_FILTERS.length
        ? ALL_FILTERS
        : (selectedStatus
              .map(
                  (status) =>
                      STATUS_FILTERS.find((filter) => filter.value === status)
                          ?.label,
              )
              // filter out undefined values / empty strings
              .filter(Boolean) as string[])
}

export function filterTicketsByStatus(
    tickets: TimelineItem[],
    selectedStatus: FilterKey[],
): TimelineItem[] {
    const isAllSelected = selectedStatus.length === STATUS_FILTERS.length

    if (isAllSelected) return tickets

    const isOpenSelected = selectedStatus.includes('open')
    const isClosedSelected = selectedStatus.includes('closed')
    const isSnoozeSelected = selectedStatus.includes('snooze')

    return tickets.filter((ticket) => {
        const extractedTicket = toTicket(ticket)

        if (!extractedTicket) return false

        if (isOpenSelected && extractedTicket.status === 'open') {
            return true
        }

        if (
            isClosedSelected &&
            extractedTicket.status === 'closed' &&
            !extractedTicket.snooze_datetime
        ) {
            return true
        }

        if (
            isSnoozeSelected &&
            extractedTicket.snooze_datetime &&
            extractedTicket.status === 'closed'
        ) {
            return true
        }

        return false
    })
}
