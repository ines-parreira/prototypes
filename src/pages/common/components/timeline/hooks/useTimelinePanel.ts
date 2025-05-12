import { useMemo } from 'react'

import { useSearchParam } from 'hooks/useSearchParam'

import { TIMELINE_SEARCH_PARAM } from '../constants'

export function useTimelinePanel() {
    const [shopperId, setShopperId] = useSearchParam(TIMELINE_SEARCH_PARAM)

    return useMemo(
        () => ({
            isOpen: Boolean(shopperId),
            shopperId: shopperId ? Number(shopperId) : null,
            openTimeline: (shopperId: number) =>
                setShopperId(shopperId.toString()),
            closeTimeline: () => setShopperId(null),
        }),
        [shopperId, setShopperId],
    )
}
