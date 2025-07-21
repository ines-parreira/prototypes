import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'

interface UseKnowledgeTrackingProps {
    shopName: string
}

interface KnowledgeTrackingCallbacks {
    onKnowledgeSourcesViewed: () => void
    onKnowledgeSourcesFiltered: ({ type }: { type: string }) => void
    onKnowledgeContentCreated: ({
        type,
        createdFrom,
        createdHow,
    }: {
        type: string
        createdFrom: string
        createdHow: string
    }) => void
    onKnowledgeContentEdited: ({
        type,
        editedFrom,
    }: {
        type: string
        editedFrom: string
    }) => void
}

export const useKnowledgeTracking = ({
    shopName,
}: UseKnowledgeTrackingProps): KnowledgeTrackingCallbacks => {
    const eventContext = useMemo(() => ({ shopName }), [shopName])

    const onKnowledgeSourcesViewed = useCallback(() => {
        logEvent(SegmentEvent.AiAgentKnowledgeSourcesViewed, eventContext)
    }, [eventContext])

    const onKnowledgeSourcesFiltered = useCallback(
        ({ type }: { type: string }) => {
            logEvent(SegmentEvent.AiAgentKnowledgeSourcesFiltered, {
                ...eventContext,
                type,
            })
        },
        [eventContext],
    )

    const onKnowledgeContentCreated = useCallback(
        ({
            type,
            createdFrom,
            createdHow,
        }: {
            type: string
            createdFrom: string
            createdHow: string
        }) => {
            logEvent(SegmentEvent.AiAgentKnowledgeContentCreated, {
                ...eventContext,
                type,
                createdFrom,
                createdHow,
            })
        },
        [eventContext],
    )

    const onKnowledgeContentEdited = useCallback(
        ({ type, editedFrom }: { type: string; editedFrom: string }) => {
            logEvent(SegmentEvent.AiAgentKnowledgeContentEdited, {
                ...eventContext,
                type,
                editedFrom,
            })
        },
        [eventContext],
    )

    return {
        onKnowledgeSourcesViewed,
        onKnowledgeSourcesFiltered,
        onKnowledgeContentCreated,
        onKnowledgeContentEdited,
    }
}
