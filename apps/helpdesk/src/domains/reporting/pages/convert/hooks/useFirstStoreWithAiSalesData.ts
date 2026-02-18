import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { totalNumberOfGroupedSalesOpportunityConvFromAIAgentQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'

export const useFirstStoreWithAiSalesData = ({
    enabled,
}: {
    enabled?: boolean
}): {
    storeId: number | null
    isLoading: boolean
} => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data, isFetching } = useMetricPerDimension(
        totalNumberOfGroupedSalesOpportunityConvFromAIAgentQueryFactory(
            cleanStatsFilters,
            userTimezone,
        ),
        undefined,
        enabled,
    )

    const storeId = data?.allData?.length
        ? Number(
              data.allData[0][
                  AiSalesAgentConversationsDimension.StoreIntegrationId
              ],
          )
        : null

    return {
        storeId,
        isLoading: isFetching,
    }
}
