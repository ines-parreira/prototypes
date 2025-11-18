import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

export const useTicketPrint = () => {
    const { ticketId } = useParams<{ ticketId: string }>()

    const handleTicketPrint = useCallback(() => {
        logEvent(SegmentEvent.PrintTicketClicked)
        setTimeout(() => {
            window.open(`/app/ticket/${ticketId}/print`)
        }, 1)
    }, [ticketId])

    return { handleTicketPrint }
}
