import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

interface usePlaygroundTrackingProps {
    shopName: string
}

interface PlaygroundTrackingCallbacks {
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
}: usePlaygroundTrackingProps): PlaygroundTrackingCallbacks => {
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
