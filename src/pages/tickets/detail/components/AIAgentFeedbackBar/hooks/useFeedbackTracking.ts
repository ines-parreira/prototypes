import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'

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
}

export const useFeedbackTracking = ({
    ticketId,
    accountId,
    userId,
}: UseFeedbackTrackingProps): FeedbackTrackingCallbacks => {
    const eventContext = {
        ticketId,
        accountId,
        userId,
    }

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

    return {
        onKnowledgeResourceClick,
        onKnowledgeResourceEditClick,
        onKnowledgeResourceCreateClick,
        onKnowledgeResourceSaved,
    }
}
