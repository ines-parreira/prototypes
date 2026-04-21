import {
    getStatsTrendFetch,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentShoppingAssistantSuccessRateTrendQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'

export const useAiAgentShoppingAssistantSuccessRateTrend = getStatsTrendHook(
    aiAgentShoppingAssistantSuccessRateTrendQueryFactory,
)

export const fetchAiAgentShoppingAssistantSuccessRateTrend = getStatsTrendFetch(
    aiAgentShoppingAssistantSuccessRateTrendQueryFactory,
)
