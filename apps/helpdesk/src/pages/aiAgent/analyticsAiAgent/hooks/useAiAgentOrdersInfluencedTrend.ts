import {
    getStatsTrendFetch,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { ordersInfluencedCountQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'

export const useAiAgentOrdersInfluencedTrend = getStatsTrendHook(
    ordersInfluencedCountQueryV2Factory,
)

export const fetchAiAgentOrdersInfluencedTrend = getStatsTrendFetch(
    ordersInfluencedCountQueryV2Factory,
)
