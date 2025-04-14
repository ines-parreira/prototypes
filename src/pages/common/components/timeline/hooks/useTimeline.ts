import { useMemo, useState } from 'react'

import { List } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { useSearchParam } from 'hooks/useSearchParam'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { getTicketState } from 'state/ticket/selectors'

import { TIMELINE_SEARCH_PARAM } from '../constants'
import { ReduxCustomerHistory } from '../types'

export function useTimeline() {
    const ticket = useAppSelector(getTicketState)
    const isLoading = (
        useAppSelector(getLoading).toJS() as {
            history: boolean
        }
    ).history
    // For now, this generate a new object every time the component is rendered
    // So the useMemo below is useless but it will change once we use RQ
    const customerHistory = useAppSelector(
        getCustomerHistory,
    ).toJS() as ReduxCustomerHistory

    const [previousShopperId, setPreviousShopperId] = useState<string | null>(
        '',
    )
    const [timelineShopperId, setTimelineShopperId] = useSearchParam(
        TIMELINE_SEARCH_PARAM,
    )

    if (previousShopperId !== timelineShopperId) {
        logEvent(SegmentEvent.UserHistoryToggled, {
            open: !!timelineShopperId,
            nbOfTicketsInTimeline: customerHistory.tickets.length,
            nbOfMessagesInTicket:
                (ticket.get('messages') as List<any>)?.size ?? 0,
            channel: ticket.get('channel'),
        })
        setPreviousShopperId(timelineShopperId)
    }

    return useMemo(
        () => ({
            isLoading,
            hasTriedLoading: customerHistory.triedLoading,
            isOpen: Boolean(timelineShopperId),
            timelineShopperId,
            tickets: customerHistory.tickets,
            openTimeline: (shopperId: number) =>
                setTimelineShopperId(shopperId.toString()),
            closeTimeline: () => setTimelineShopperId(null),
        }),
        [isLoading, customerHistory, timelineShopperId, setTimelineShopperId],
    )
}
