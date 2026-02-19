import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import useAppSelector from 'hooks/useAppSelector'
import type {
    OpportunityOperation,
    OpportunityPageReferrer,
} from 'pages/aiAgent/opportunities/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

interface OpportunitiesTrackingCallbacks {
    onOpportunityPageVisited: () => void
    onOpportunityViewed: (context: OpportunityContext) => void
    onOpportunityAccepted: (context: OpportunityContext) => void
    onOpportunityDismissed: (context: OpportunityContext) => void
    onRedirectToOpportunityPage: (context: RedirectContext) => void
}

interface OpportunityContext {
    opportunityId: string
    opportunityType: string
    operations?: OpportunityOperation[]
}

interface RedirectContext {
    referrer: OpportunityPageReferrer
}

export const useOpportunitiesTracking = (): OpportunitiesTrackingCallbacks => {
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
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

    const onRedirectToOpportunityPage = useCallback(
        (context: RedirectContext) => {
            logEvent(SegmentEvent.RedirectToOpportunityPage, {
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
        onRedirectToOpportunityPage,
    }
}
