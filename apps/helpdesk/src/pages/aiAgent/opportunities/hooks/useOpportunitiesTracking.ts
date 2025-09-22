import { useCallback, useMemo } from 'react'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'

interface UseOpportunitiesTrackingProps {
    accountId: number
    userId: number
}

interface OpportunitiesTrackingCallbacks {
    onOpportunityPageVisited: () => void
    onOpportunityViewed: (context: OpportunityContext) => void
    onOpportunityAccepted: (context: OpportunityContext) => void
    onOpportunityDismissed: (context: OpportunityContext) => void
}

interface OpportunityContext {
    opportunityId: string
    opportunityType: string
}

export const useOpportunitiesTracking = ({
    accountId,
    userId,
}: UseOpportunitiesTrackingProps): OpportunitiesTrackingCallbacks => {
    const eventContext = useMemo(() => {
        return {
            accountId,
            userId,
        }
    }, [accountId, userId])

    const onOpportunityPageVisited = useCallback(() => {
        logEvent(SegmentEvent.OpportunityPageVisited, eventContext)
    }, [eventContext])

    const onOpportunityViewed = useCallback(
        (context: OpportunityContext) => {
            logEvent(SegmentEvent.OpportunityViewed, {
                ...eventContext,
                ...context,
            })
        },
        [eventContext],
    )

    const onOpportunityAccepted = useCallback(
        (context: OpportunityContext) => {
            logEvent(SegmentEvent.OpportunityAccepted, {
                ...eventContext,
                ...context,
            })
        },
        [eventContext],
    )

    const onOpportunityDismissed = useCallback(
        (context: OpportunityContext) => {
            logEvent(SegmentEvent.OpportunityDismissed, {
                ...eventContext,
                ...context,
            })
        },
        [eventContext],
    )

    return {
        onOpportunityPageVisited,
        onOpportunityViewed,
        onOpportunityAccepted,
        onOpportunityDismissed,
    }
}
