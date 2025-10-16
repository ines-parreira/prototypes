import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'

type UsePlaygroundTrackingProps = {
    shopName: string
}

type PlaygroundTrackingCallbacks = {
    onTestPageViewed: () => void
    onPlaygroundReset: () => void
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
    const currentPath = window.location.pathname
    const eventContext = useMemo(
        () => ({ shopName, currentPath }),
        [shopName, currentPath],
    )

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

    const onPlaygroundReset = useCallback(() => {
        logEvent(SegmentEvent.AiAgentTestReset, {
            ...eventContext,
        })
    }, [eventContext])

    return {
        onTestPageViewed,
        onTestMessageSent,
        onPlaygroundReset,
    }
}
