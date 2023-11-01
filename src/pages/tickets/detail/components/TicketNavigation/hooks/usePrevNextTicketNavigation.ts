import {logEvent, SegmentEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import {_goToNextOrPrevTicket, clearTicket} from 'state/ticket/actions'

export default function usePrevNextTicketNavigation(
    direction: 'prev' | 'next',
    ticketNumber: string
) {
    const dispatch = useAppDispatch()

    const goToNextOrPrevTicket = (
        direction: 'prev' | 'next',
        ticketNumber: string
    ) => {
        dispatch(clearTicket())

        void dispatch(
            _goToNextOrPrevTicket(parseFloat(ticketNumber), direction)
        )
    }

    return () => {
        switch (direction) {
            case 'prev':
                logEvent(SegmentEvent.TicketPreviousNavigation)
                goToNextOrPrevTicket('prev', ticketNumber)
                break
            case 'next':
                logEvent(SegmentEvent.TicketNextNavigation)
                goToNextOrPrevTicket('next', ticketNumber)
                break
        }
    }
}
