import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'

type UsePlaygroundTrackingProps = {
    shopName: string
}

type PlaygroundTrackingCallbacks = {
    onTestPageViewed: () => void
    onTestMessageSent: ({
        channel,
        playgroundSettings,
    }: {
        channel: string
        playgroundSettings: string
    }) => void
}

export const usePlaygroundTracking = ({
    shopName,
}: UsePlaygroundTrackingProps): PlaygroundTrackingCallbacks => {
    const eventContext = useMemo(() => ({ shopName }), [shopName])

    const onTestPageViewed = useCallback(() => {
        logEvent(SegmentEvent.AiAgentTestPageViewed, {
            ...eventContext,
        })
    }, [eventContext])

    const onTestMessageSent = useCallback(
        ({
            channel,
            playgroundSettings,
        }: {
            channel: string
            playgroundSettings: string
        }) => {
            logEvent(SegmentEvent.AiAgentTestMessageSent, {
                ...eventContext,
                channel,
                playgroundSettings,
            })
        },
        [eventContext],
    )

    return {
        onTestPageViewed,
        onTestMessageSent,
    }
}
