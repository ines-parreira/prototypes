import { useAIJourneyOptOutAfterReply } from 'AIJourney/hooks/useAIJourneyOptOutAfterReply/useAIJourneyOptOutAfterReply'
import { useAIJourneyOptOutAfterReplyRate } from 'AIJourney/hooks/useAIJourneyOptOutAfterReplyRate/useAIJourneyOptOutAfterReplyRate'
import { useAIJourneyOptOutRate } from 'AIJourney/hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate'
import { useAIJourneyTotalConversations } from 'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations'
import { useAIJourneyTotalOptOuts } from 'AIJourney/hooks/useAIJourneyTotalOptOuts/useAIJourneyTotalOptOuts'
import { useAIJourneyTotalReplies } from 'AIJourney/hooks/useAIJourneyTotalReplies/useAIJourneyTotalReplies'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'

export const useAIJourneyAudienceHealthMetrics = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    shopName: string,
    journeyIds: string[],
) => {
    const totalConversations = useAIJourneyTotalConversations(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )

    const optOutRate = useAIJourneyOptOutRate(
        integrationId,
        userTimezone,
        filters,
        shopName,
        journeyIds,
    )

    const totalOptOut = useAIJourneyTotalOptOuts(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )

    const recipientsWhoReplied = useAIJourneyTotalReplies(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )

    const optOutRateAfterReply = useAIJourneyOptOutAfterReplyRate(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )

    const optedOutAfterReply = useAIJourneyOptOutAfterReply(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )

    return [
        totalConversations,
        optOutRate,
        totalOptOut,
        recipientsWhoReplied,
        optOutRateAfterReply,
        optedOutAfterReply,
    ]
}
