import useTicketPartials from './useTicketPartials'

export default function useTickets(viewId: number) {
    const {hasMore, loading, loadMore, partials} = useTicketPartials(viewId)

    const tickets = partials

    return {hasMore, loading, loadMore, tickets}
}
