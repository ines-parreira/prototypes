import {useEffect, useState} from 'react'
import {Map} from 'immutable'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'

export type Options = {
    isReady: boolean
    integration: Map<any, any>
}

export default function useIntegrationPageViewLogEvent(
    event: SegmentEvent,
    options: Options
) {
    const [trackedPageViewed, setTrackedPageViewed] = useState(false)

    useEffect(() => {
        if (options.isReady && !trackedPageViewed) {
            const id = options.integration?.get('id')
            logEvent(event, (id && {id}) || {})
            setTrackedPageViewed(true)
        }
    }, [trackedPageViewed, event, options.isReady, options.integration])
}
