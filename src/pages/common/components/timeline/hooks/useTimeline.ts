import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useSearchParam } from 'hooks/useSearchParam'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'

import { TIMELINE_SEARCH_PARAM } from '../constants'
import { ReduxCustomerHistory } from '../types'

export function useTimeline() {
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

    const [timelineShopperId, setTimelineShopperId] = useSearchParam(
        TIMELINE_SEARCH_PARAM,
    )

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
