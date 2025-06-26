import { useCallback, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'

export function useTicketModal(ticketIds: number[]) {
    const [ticketId, setTicketId] = useState<number | null>(null)

    const currentTicketIndex = useMemo(
        () => (!ticketId ? -1 : ticketIds.indexOf(ticketId)),
        [ticketId, ticketIds],
    )

    const nextTicketId: number | undefined =
        currentTicketIndex === -1
            ? undefined
            : ticketIds[currentTicketIndex + 1]
    const previousTicketId: number | undefined =
        currentTicketIndex === -1
            ? undefined
            : ticketIds[currentTicketIndex - 1]

    const handleClose = useCallback(() => {
        setTicketId(null)
    }, [])

    const handleOpen = useCallback((specifiedTicketId: number) => {
        setTicketId(specifiedTicketId)
    }, [])

    const handleNext = useMemo(
        () =>
            !nextTicketId
                ? undefined
                : () => {
                      logEvent(SegmentEvent.CustomerTimelineModalNextClicked)
                      setTicketId(nextTicketId)
                  },
        [nextTicketId],
    )

    const handlePrevious = useMemo(
        () =>
            !previousTicketId
                ? undefined
                : () => {
                      logEvent(SegmentEvent.CustomerTimelineModalPrevClicked)
                      setTicketId(previousTicketId)
                  },
        [previousTicketId],
    )

    return useMemo(
        () => ({
            ticketId,
            onClose: handleClose,
            onNext: handleNext,
            onOpen: handleOpen,
            onPrevious: handlePrevious,
        }),
        [handleClose, handleNext, handleOpen, handlePrevious, ticketId],
    )
}
