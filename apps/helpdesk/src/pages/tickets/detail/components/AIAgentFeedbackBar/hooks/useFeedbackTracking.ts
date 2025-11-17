import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import type { AiAgentKnowledgeResourceTypeEnum } from '../types'

interface UseFeedbackTrackingProps {
    ticketId: number
    accountId: number
    userId: number
}

interface FeedbackTrackingCallbacks {
    onKnowledgeResourceClick: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
    ) => void
    onKnowledgeResourceEditClick: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
    ) => void
    onKnowledgeResourceCreateClick: (
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
    ) => void
    onKnowledgeResourceSaved: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
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
        resourceType: AiAgentKnowledgeResourceTypeEnum,
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
        resourceType: AiAgentKnowledgeResourceTypeEnum,
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
        resourceType: AiAgentKnowledgeResourceTypeEnum,
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
        resourceType: AiAgentKnowledgeResourceTypeEnum,
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
