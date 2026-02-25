import type { TicketThreadItem } from './types'

export function sortTicketThreadItems(
    items: TicketThreadItem[],
): TicketThreadItem[] {
    return items.sort((a, b) => {
        const aDatetime = 'datetime' in a ? a.datetime : undefined
        const bDatetime = 'datetime' in b ? b.datetime : undefined

        if (!aDatetime && !bDatetime) return 0
        if (!aDatetime) return 1
        if (!bDatetime) return -1

        return aDatetime.localeCompare(bDatetime)
    })
}
