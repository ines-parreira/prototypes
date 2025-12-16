type GetMergeTicketsSearchFiltersParams = {
    search: string
    ticketId: number
    customerId?: number
}

export function getMergeTicketsSearchFilters({
    search,
    ticketId,
    customerId,
}: GetMergeTicketsSearchFiltersParams): string {
    const defaultFilter = `neq(ticket.id, ${ticketId})`

    if (search.trim().length === 0) {
        return customerId
            ? `${defaultFilter} && eq(ticket.customer.id, ${customerId})`
            : defaultFilter
    }

    return defaultFilter
}
