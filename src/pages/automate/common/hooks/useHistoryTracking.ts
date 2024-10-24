import {useHistory} from 'react-router-dom'

import {SegmentEvent, logEvent} from 'common/segment'
import useEffectOnce from 'hooks/useEffectOnce'

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
