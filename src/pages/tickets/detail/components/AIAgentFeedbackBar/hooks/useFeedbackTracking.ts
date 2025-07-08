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
    ) => void
    onKnowledgeResourceEditClick: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
    ) => void
    onKnowledgeResourceCreateClick: (
        resourceType: AiAgentKnowledgeResourceTypeEnum,
    ) => void
    onKnowledgeResourceSaved: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
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
    ) => {
        logEvent(SegmentEvent.AiAgentFeedbackKnowledgeResourceClicked, {
            ...eventContext,
            resourceId,
            resourceType,
        })
    }

    const onKnowledgeResourceEditClick = (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
    ) => {
        logEvent(SegmentEvent.AiAgentFeedbackKnowledgeResourceEditClicked, {
            ...eventContext,
            resourceId,
            resourceType,
        })
    }

    const onKnowledgeResourceCreateClick = (
        resourceType: AiAgentKnowledgeResourceTypeEnum,
    ) => {
        logEvent(SegmentEvent.AiAgentFeedbackKnowledgeResourceCreateClicked, {
            ...eventContext,
            resourceType,
        })
    }

    const onKnowledgeResourceSaved = (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        isNew: boolean,
    ) => {
        logEvent(SegmentEvent.AiAgentFeedbackKnowledgeResourceSaved, {
            ...eventContext,
            resourceId,
            resourceType,
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
