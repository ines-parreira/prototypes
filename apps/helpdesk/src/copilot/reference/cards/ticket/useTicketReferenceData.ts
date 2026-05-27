import { useGetTicket } from '@gorgias/helpdesk-queries'

type Params = {
    ticketId: number
    enabled: boolean
}

/**
 * Lazy ticket fetch for the hover-card preview. Mirrors the disabled-until-
 * hover pattern used by `useGuidanceReferenceData`, so no request fires until
 * the popover is open.
 */
export function useTicketReferenceData({ ticketId, enabled }: Params) {
    const { data, isLoading, isError } = useGetTicket(ticketId, undefined, {
        query: { enabled },
    })

    return {
        ticket: data?.data,
        isLoading: enabled && isLoading,
        isError,
    }
}
