import { useAIJourneyOptOutAfterReply } from 'AIJourney/hooks/useAIJourneyOptOutAfterReply/useAIJourneyOptOutAfterReply'
import { useAIJourneyOptOutAfterReplyRate } from 'AIJourney/hooks/useAIJourneyOptOutAfterReplyRate/useAIJourneyOptOutAfterReplyRate'
import { useAIJourneyOptOutRate } from 'AIJourney/hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate'
import { useAIJourneyTotalConversations } from 'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations'
import { useAIJourneyTotalOptOuts } from 'AIJourney/hooks/useAIJourneyTotalOptOuts/useAIJourneyTotalOptOuts'
import { useAIJourneyTotalReplies } from 'AIJourney/hooks/useAIJourneyTotalReplies/useAIJourneyTotalReplies'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'

type UseAIJourneyAudienceHealthMetricsOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    shopName: string
    journeyIds: string[]
    forceEmpty?: boolean
}

export const useAIJourneyAudienceHealthMetrics = ({
    integrationId,
    userTimezone,
    filters,
    shopName,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyAudienceHealthMetricsOptions) => {
    const totalConversations = useAIJourneyTotalConversations({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

    const optOutRate = useAIJourneyOptOutRate({
        integrationId,
        userTimezone,
        filters,
        shopName,
        journeyIds,
        forceEmpty,
    })

    const totalOptOut = useAIJourneyTotalOptOuts({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

    const recipientsWhoReplied = useAIJourneyTotalReplies({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

    const optOutRateAfterReply = useAIJourneyOptOutAfterReplyRate({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

    const optedOutAfterReply = useAIJourneyOptOutAfterReply({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

    return [
        totalConversations,
        optOutRate,
        totalOptOut,
        recipientsWhoReplied,
        optOutRateAfterReply,
        optedOutAfterReply,
    ]
}
