import { logEvent } from '@repo/logging'
import type { SegmentEvent } from '@repo/logging'
import { useHistory } from 'react-router-dom'
import { useEffectOnce } from '@gorgias/toolkit-react'

type HistoryTrackingState = {
    from: string
}

export function useHistoryTracking(segmentEvent: SegmentEvent) {
    const history = useHistory<HistoryTrackingState>()

    useEffectOnce(() => {
        logEvent(segmentEvent, {
            location: history.location?.state?.from,
        })
    })
}
