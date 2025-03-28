import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { AiSalesAgentConversationsDimension } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { totalNumberOfGroupedSalesOpportunityConvFromAIAgentQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'

export const useFirstStoreWithAiSalesData = ({
    enabled,
}: {
    enabled?: boolean
}): {
    storeId: number | null
    isLoading: boolean
} => {
    const { userTimezone } = useStatsFilters()

    const { data, isFetching } = useMetricPerDimension(
        totalNumberOfGroupedSalesOpportunityConvFromAIAgentQueryFactory(
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
