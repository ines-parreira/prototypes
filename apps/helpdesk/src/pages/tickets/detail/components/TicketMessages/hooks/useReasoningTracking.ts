import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

interface UseReasoningTrackingProps {
    ticketId?: number
    accountId: number
    userId: number
    messageId?: number
}

interface ReasoningTrackingCallbacks {
    onReasoningOpened: () => void
}

export const useReasoningTracking = ({
    ticketId,
    accountId,
    userId,
    messageId,
}: UseReasoningTrackingProps): ReasoningTrackingCallbacks => {
    const eventContext = useMemo(() => {
        return {
            ticketId,
            accountId,
            userId,
            messageId,
        }
    }, [ticketId, accountId, userId, messageId])

    const onReasoningOpened = useCallback(() => {
        logEvent(SegmentEvent.AiAgentReasoningOpened, eventContext)
    }, [eventContext])

    return {
        onReasoningOpened,
    }
}
