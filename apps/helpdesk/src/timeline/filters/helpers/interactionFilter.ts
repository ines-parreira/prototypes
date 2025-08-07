import { ALL_FILTERS, INTERACTION_FILTER_OPTIONS } from '../../constants'
import { isTicket } from '../../helpers/timelineItem'
import { InteractionFilterType, TimelineItem } from '../../types'

export function getTypeOptionLabels(selectedType: InteractionFilterType[]) {
    return selectedType.length === INTERACTION_FILTER_OPTIONS.length
        ? ALL_FILTERS
        : (selectedType
              .map(
                  (type) =>
                      INTERACTION_FILTER_OPTIONS.find(
                          (filter) => filter.value === type,
                      )?.label,
              )
              // filter out undefined values / empty strings
              .filter(Boolean) as string[])
}

export function filterTicketsByType(
    tickets: TimelineItem[],
    selectedType: InteractionFilterType[],
) {
    const isAllSelected =
        selectedType.length === INTERACTION_FILTER_OPTIONS.length

    if (isAllSelected) return tickets

    if (selectedType[0] === 'ticket') {
        return tickets.filter(isTicket)
    }
    return tickets.filter((ticket) => !isTicket(ticket))
}
