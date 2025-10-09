import { useGetTicket } from '@gorgias/helpdesk-queries'

export function useGetTicketData(ticketId: string) {
    return useGetTicket(Number(ticketId), undefined, {
        query: {
            staleTime: 60000 * 5,
        },
    })
}
