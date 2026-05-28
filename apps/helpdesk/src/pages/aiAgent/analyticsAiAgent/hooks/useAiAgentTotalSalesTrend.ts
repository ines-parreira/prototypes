import {
    getStatsTrendFetch,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { totalSalesAmountUsdQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'

export const useAiAgentTotalSalesTrend = getStatsTrendHook(
    totalSalesAmountUsdQueryV2Factory,
)

export const fetchAiAgentTotalSalesTrend = getStatsTrendFetch(
    totalSalesAmountUsdQueryV2Factory,
)
