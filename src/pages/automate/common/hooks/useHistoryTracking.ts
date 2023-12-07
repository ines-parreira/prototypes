// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useEffectOnce} from 'react-use'
import {useHistory} from 'react-router-dom'
import {SegmentEvent, logEvent} from 'common/segment'

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
