import type {
    SearchTicketsOrderBy,
    TicketCompact,
    TicketHighlightDataItemHighlights,
} from '@gorgias/helpdesk-types'

export type SearchTicket = TicketCompact & {
    highlights?: TicketHighlightDataItemHighlights
}

export type TicketSearchParams = {
    query: string
    filters: string
    cursor?: string
}

export type UseTicketSearchOptions = {
    query: string
    filters: string
    cursor?: string
    limit: number
    orderBy: SearchTicketsOrderBy
    enabled?: boolean
}
