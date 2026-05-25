import { useGetTicket } from '../../../../../hooks/useGetTicket'

export function useGetTicketData(ticketId: string) {
    return useGetTicket(Number(ticketId))
}
