import { FALLBACK_SORT_KEY } from '../../constants'
import { SortOption, TimelineItem, TimelineItemKind } from '../../types'

function getSortableValue(item: TimelineItem, key: string): string | null {
    switch (item.kind) {
        case TimelineItemKind.Ticket:
            return item.ticket[key as keyof typeof item.ticket] as string | null
        case TimelineItemKind.Order:
            // Map ticket sorting keys to order properties
            if (key === 'created_datetime') {
                return item.order.created_at
            }
            if (
                key === 'last_message_datetime' ||
                key === 'last_received_message_datetime'
            ) {
                // Orders don't have message datetime, so use updated_at as fallback
                return item.order.updated_at
            }
            // Default to created_at for any other sorting key
            return item.order.created_at
        default:
            return null
    }
}

export function sortTickets(tickets: TimelineItem[], sortOption: SortOption) {
    return [...tickets].sort((a: TimelineItem, b: TimelineItem) => {
        const aValue =
            getSortableValue(a, sortOption.key) ||
            getSortableValue(a, FALLBACK_SORT_KEY) ||
            ''
        const bValue =
            getSortableValue(b, sortOption.key) ||
            getSortableValue(b, FALLBACK_SORT_KEY) ||
            ''

        const aField = new Date(aValue).getTime()
        const bField = new Date(bValue).getTime()

        if (sortOption.order === 'asc') {
            return aField - bField
        }

        return bField - aField
    })
}
