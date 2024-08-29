import {logEvent, SegmentEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import {_goToNextOrPrevTicket, clearTicket} from 'state/ticket/actions'

export default function usePrevNextTicketNavigation(
    direction: 'prev' | 'next',
    ticketNumber: string
) {
    const dispatch = useAppDispatch()

    const goToNextOrPrevTicket = async (
        direction: 'prev' | 'next',
        ticketNumber: string
    ) => {
        dispatch(clearTicket())

        await dispatch(
            _goToNextOrPrevTicket(parseFloat(ticketNumber), direction)
        )
    }

    return async () => {
        switch (direction) {
            case 'prev':
                logEvent(SegmentEvent.TicketPreviousNavigation)
                await goToNextOrPrevTicket('prev', ticketNumber)
                break
            case 'next':
                logEvent(SegmentEvent.TicketNextNavigation)
                await goToNextOrPrevTicket('next', ticketNumber)
                break
        }
    }
}
