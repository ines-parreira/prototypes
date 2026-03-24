import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

type FeedbackTrackingResourceType = string

interface UseFeedbackTrackingProps {
    ticketId: number
    accountId: number
    userId: number
}

interface FeedbackTrackingCallbacks {
    onKnowledgeResourceClick: (
        resourceId: string,
        resourceType: FeedbackTrackingResourceType,
        resourceSetId: string,
    ) => void
    onKnowledgeResourceEditClick: (
        resourceId: string,
        resourceType: FeedbackTrackingResourceType,
        resourceSetId: string,
    ) => void
    onKnowledgeResourceCreateClick: (
        resourceType: FeedbackTrackingResourceType,
        resourceSetId: string,
    ) => void
    onKnowledgeResourceSaved: (
        resourceId: string,
        resourceType: FeedbackTrackingResourceType,
        resourceSetId: string,
        isNew: boolean,
    ) => void
    onFeedbackTabOpened: (openedFrom: string) => void
    onFeedbackGiven: (type: string) => void
}

export const useFeedbackTracking = ({
    ticketId,
    accountId,
    userId,
}: UseFeedbackTrackingProps): FeedbackTrackingCallbacks => {
    const eventContext = useMemo(() => {
        return {
            ticketId,
            accountId,
            userId,
        }
    }, [ticketId, accountId, userId])

    const onKnowledgeResourceClick = (
        resourceId: string,
        resourceType: FeedbackTrackingResourceType,
        resourceSetId: string,
    ) => {
        logEvent(SegmentEvent.AiAgentFeedbackKnowledgeResourceClicked, {
            ...eventContext,
            resourceId,
            resourceType,
            resourceSetId,
        })
    }

    const onKnowledgeResourceEditClick = (
        resourceId: string,
        resourceType: FeedbackTrackingResourceType,
        resourceSetId: string,
    ) => {
        logEvent(SegmentEvent.AiAgentFeedbackKnowledgeResourceEditClicked, {
            ...eventContext,
            resourceId,
            resourceType,
            resourceSetId,
        })
    }

    const onKnowledgeResourceCreateClick = (
        resourceType: FeedbackTrackingResourceType,
        resourceSetId: string,
    ) => {
        logEvent(SegmentEvent.AiAgentFeedbackKnowledgeResourceCreateClicked, {
            ...eventContext,
            resourceType,
            resourceSetId,
        })
    }

    const onKnowledgeResourceSaved = (
        resourceId: string,
        resourceType: FeedbackTrackingResourceType,
        resourceSetId: string,
        isNew: boolean,
    ) => {
        logEvent(SegmentEvent.AiAgentFeedbackKnowledgeResourceSaved, {
            ...eventContext,
            resourceId,
            resourceType,
            resourceSetId,
            isNew,
        })
    }

    const onFeedbackTabOpened = useCallback(
        (openedFrom: string) => {
            logEvent(SegmentEvent.AiAgentFeedbackTabOpened, {
                ...eventContext,
                openedFrom,
            })
        },
        [eventContext],
    )

    const onFeedbackGiven = useCallback(
        (type: string) => {
            logEvent(SegmentEvent.AiAgentFeedbackGiven, {
                ...eventContext,
                type,
            })
        },
        [eventContext],
    )

    return {
        onKnowledgeResourceClick,
        onKnowledgeResourceEditClick,
        onKnowledgeResourceCreateClick,
        onKnowledgeResourceSaved,
        onFeedbackTabOpened,
        onFeedbackGiven,
    }
}
