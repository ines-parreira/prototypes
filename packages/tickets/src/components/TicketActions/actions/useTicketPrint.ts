import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

export const useTicketPrint = (ticketId: number) => {
    const handleTicketPrint = useCallback(() => {
        logEvent(SegmentEvent.PrintTicketClicked)
        setTimeout(() => {
            window.open(`/app/ticket/${ticketId}/print`)
        }, 1)
    }, [ticketId])

    return { handleTicketPrint }
}
