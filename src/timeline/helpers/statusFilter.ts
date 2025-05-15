import { TicketCompact } from '@gorgias/api-queries'

import { STATUS_FILTERS } from '../constants'
import { FilterKey } from '../types'

export function getOptionLabels(selectedStatus: FilterKey[]): string[] {
    return selectedStatus.length === STATUS_FILTERS.length
        ? ['All']
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
    tickets: TicketCompact[],
    selectedStatus: FilterKey[],
): TicketCompact[] {
    const isAllSelected = selectedStatus.length === STATUS_FILTERS.length
    if (isAllSelected) return tickets

    const isOpenSelected = selectedStatus.includes('open')
    const isClosedSelected = selectedStatus.includes('closed')
    const isSnoozeSelected = selectedStatus.includes('snooze')

    return tickets.filter((ticket) => {
        if (!ticket.status) return false

        if (isOpenSelected && ticket.status === 'open') {
            return true
        }

        if (
            isClosedSelected &&
            ticket.status === 'closed' &&
            !ticket.snooze_datetime
        ) {
            return true
        }

        if (
            isSnoozeSelected &&
            ticket.snooze_datetime &&
            ticket.status === 'closed'
        ) {
            return true
        }

        return false
    })
}
