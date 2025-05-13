import { useState } from 'react'

import { List } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { getTicketState } from 'state/ticket/selectors'

import { useTimeline } from './useTimeline'

export function useTrackTimelineToggle() {
    const ticket = useAppSelector(getTicketState)
    const { tickets, timelineShopperId } = useTimeline()

    const [previousShopperId, setPreviousShopperId] = useState<string | null>(
        timelineShopperId,
    )

    if (previousShopperId !== timelineShopperId) {
        logEvent(SegmentEvent.UserHistoryToggled, {
            open: !!timelineShopperId,
            nbOfTicketsInTimeline: tickets.length,
            nbOfMessagesInTicket:
                (ticket.get('messages') as List<any>)?.size ?? 0,
            channel: ticket.get('channel'),
        })
        setPreviousShopperId(timelineShopperId)
    }
}
