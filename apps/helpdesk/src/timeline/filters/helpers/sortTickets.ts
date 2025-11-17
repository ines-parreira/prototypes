import { SORTABLE_KEY_TO_ORDER_KEY } from '../../constants'
import type { SortableKey, SortOption, TimelineItem } from '../../types'
import { TimelineItemKind } from '../../types'

function getSortableValue(item: TimelineItem, key: SortableKey): string | null {
    switch (item.kind) {
        case TimelineItemKind.Ticket:
            return item.ticket[key as keyof typeof item.ticket] as string | null
        case TimelineItemKind.Order:
            return item.order[SORTABLE_KEY_TO_ORDER_KEY[key]] as string | null
        default:
            return null
    }
}

export function sortTickets(tickets: TimelineItem[], sortOption: SortOption) {
    return [...tickets].sort((a: TimelineItem, b: TimelineItem) => {
        const aValue =
            getSortableValue(a, sortOption.key) ||
            getSortableValue(a, 'created_datetime') ||
            ''
        const bValue =
            getSortableValue(b, sortOption.key) ||
            getSortableValue(b, 'created_datetime') ||
            ''

        const aField = new Date(aValue).getTime()
        const bField = new Date(bValue).getTime()

        if (sortOption.order === 'asc') {
            return aField - bField
        }

        return bField - aField
    })
}
