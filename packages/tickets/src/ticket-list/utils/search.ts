import { decompressFromEncodedURIComponent } from 'lz-string'

import type { SearchTicketsOrderBy } from '@gorgias/helpdesk-types'
import { SearchTicketsOrderBy as SearchTicketsOrderByValues } from '@gorgias/helpdesk-types'

import type { TicketSearchSortableProperties } from '../../types/ticket'
import { TicketSearchParamsKeys } from '../../utils/routing'

export function decodeSearchFilters(value: string | null) {
    if (!value) {
        return ''
    }

    return decompressFromEncodedURIComponent(value) || ''
}

export function getTicketSearchParams(searchParams: URLSearchParams) {
    return {
        query: TicketSearchParamsKeys.query.parse(
            searchParams.get(TicketSearchParamsKeys.query.key),
        ),
        filters: decodeSearchFilters(
            searchParams.get(TicketSearchParamsKeys.filters.key),
        ),
        cursor: TicketSearchParamsKeys.cursor.parse(
            searchParams.get(TicketSearchParamsKeys.cursor.key),
        ),
    }
}

const searchSortableProperties = new Set<string>(
    Object.values(SearchTicketsOrderByValues),
)

export function toSearchTicketsOrderBy(order: string): SearchTicketsOrderBy {
    if (searchSortableProperties.has(order)) {
        return order as SearchTicketsOrderBy
    }

    return SearchTicketsOrderByValues.LastMessageDatetimeDesc
}

export function getSortOrderFromField(
    field: TicketSearchSortableProperties,
    desc: boolean,
): SearchTicketsOrderBy {
    const direction = desc ? 'desc' : 'asc'
    return `${field}:${direction}` as SearchTicketsOrderBy
}
