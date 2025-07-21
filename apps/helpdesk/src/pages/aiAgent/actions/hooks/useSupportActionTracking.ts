import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'

interface UseSupportActionTrackingProps {
    shopName: string
}

interface SupportActionTrackingCallbacks {
    onActionPageViewed: () => void
    onActionCreated: ({ createdHow }: { createdHow: string }) => void
    onActionEdited: () => void
}

export const useSupportActionTracking = ({
    shopName,
}: UseSupportActionTrackingProps): SupportActionTrackingCallbacks => {
    const eventContext = useMemo(() => ({ shopName }), [shopName])

    const onActionPageViewed = useCallback(() => {
        logEvent(SegmentEvent.AiAgentActionPageViewed, {
            ...eventContext,
        })
    }, [eventContext])

    const onActionCreated = useCallback(
        ({ createdHow }: { createdHow: string }) => {
            logEvent(SegmentEvent.AiAgentActionCreated, {
                ...eventContext,
                createdHow,
            })
        },
        [eventContext],
    )

    const onActionEdited = useCallback(() => {
        logEvent(SegmentEvent.AiAgentActionEdited, {
            ...eventContext,
        })
    }, [eventContext])

    return {
        onActionPageViewed,
        onActionCreated,
        onActionEdited,
    }
}
