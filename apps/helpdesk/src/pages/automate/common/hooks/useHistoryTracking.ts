import { useEffectOnce } from '@repo/hooks'
import { logEvent } from '@repo/logging'
import type { SegmentEvent } from '@repo/logging'
import { useHistory } from 'react-router-dom'

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
