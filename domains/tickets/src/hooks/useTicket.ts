import { useGetTicket } from '@gorgias/helpdesk-queries'

export function useTicket(id: number) {
    return useGetTicket(id)
}
