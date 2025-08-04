import { useEffectOnce } from '@repo/hooks'
import { useHistory } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'

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
