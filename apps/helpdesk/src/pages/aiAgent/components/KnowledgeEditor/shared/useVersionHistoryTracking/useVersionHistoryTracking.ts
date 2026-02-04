import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

interface VersionContext {
    versionId: number
    versionNumber: number
    publishedDatetime: string | null
}

interface UseVersionHistoryTrackingProps {
    shopName: string
    resourceType: 'guidance' | 'article'
    resourceId: number
    helpCenterId: number
    locale: string
}

interface VersionHistoryTrackingCallbacks {
    onVersionViewed: (context: VersionContext) => void
    onBackToCurrent: (context: VersionContext) => void
    onVersionRestored: (context: VersionContext) => void
}

export const useVersionHistoryTracking = ({
    shopName,
    resourceType,
    resourceId,
    helpCenterId,
    locale,
}: UseVersionHistoryTrackingProps): VersionHistoryTrackingCallbacks => {
    const eventContext = useMemo(
        () => ({
            shopName,
            resourceType,
            resourceId,
            helpCenterId,
            locale,
        }),
        [shopName, resourceType, resourceId, helpCenterId, locale],
    )

    const onVersionViewed = useCallback(
        (context: VersionContext) => {
            logEvent(SegmentEvent.AiAgentVersionHistoryVersionViewed, {
                ...eventContext,
                ...context,
            })
        },
        [eventContext],
    )

    const onBackToCurrent = useCallback(
        (context: VersionContext) => {
            logEvent(SegmentEvent.AiAgentVersionHistoryBackToCurrent, {
                ...eventContext,
                ...context,
            })
        },
        [eventContext],
    )

    const onVersionRestored = useCallback(
        (context: VersionContext) => {
            logEvent(SegmentEvent.AiAgentVersionHistoryVersionRestored, {
                ...eventContext,
                ...context,
            })
        },
        [eventContext],
    )

    return {
        onVersionViewed,
        onBackToCurrent,
        onVersionRestored,
    }
}
