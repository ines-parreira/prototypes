import { useState } from 'react'

import { List } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { getTicketState } from 'state/ticket/selectors'

import { useTimelinePanel } from './useTimelinePanel'

export function useTrackTimelineToggle() {
    const ticket = useAppSelector(getTicketState)
    const { isOpen, shopperId } = useTimelinePanel()

    const [previousShopperId, setPreviousShopperId] = useState(shopperId)

    if (previousShopperId !== shopperId) {
        logEvent(SegmentEvent.UserHistoryToggled, {
            open: isOpen,
            nbOfMessagesInTicket:
                (ticket.get('messages') as List<any>)?.size ?? 0,
            channel: ticket.get('channel'),
        })
        setPreviousShopperId(shopperId)
    }
}
