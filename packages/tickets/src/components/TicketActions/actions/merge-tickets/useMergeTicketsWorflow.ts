import { useCallback } from 'react'

import { useToggle } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'

export function useMergeTicketsWorflow(ticketId: number) {
    const {
        isOpen: isMergeTicketsModalOpen,
        toggle: handleMergeTicketsModalToggle,
    } = useToggle(false)

    const handleMergeTicketsModalClick = useCallback(() => {
        logEvent(SegmentEvent.TicketMergeClicked, {
            sourceTicketId: ticketId,
        })
        handleMergeTicketsModalToggle(true)
    }, [ticketId, handleMergeTicketsModalToggle])

    return {
        isMergeTicketsModalOpen,
        handleMergeTicketsModalToggle,
        handleMergeTicketsModalClick,
    }
}
