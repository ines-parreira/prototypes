import { logEvent, SegmentEvent } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import { _goToNextOrPrevTicket, clearTicket } from 'state/ticket/actions'

export default function usePrevNextTicketNavigation(
    direction: 'prev' | 'next',
    ticketId?: string,
) {
    const dispatch = useAppDispatch()

    const goToNextOrPrevTicket = async (
        direction: 'prev' | 'next',
        ticketId: string,
    ) => {
        dispatch(clearTicket())

        await dispatch(_goToNextOrPrevTicket(parseFloat(ticketId), direction))
    }

    return async () => {
        if (!ticketId) return
        switch (direction) {
            case 'prev':
                logEvent(SegmentEvent.TicketPreviousNavigation)
                await goToNextOrPrevTicket('prev', ticketId)
                break
            case 'next':
                logEvent(SegmentEvent.TicketNextNavigation)
                await goToNextOrPrevTicket('next', ticketId)
                break
        }
    }
}
