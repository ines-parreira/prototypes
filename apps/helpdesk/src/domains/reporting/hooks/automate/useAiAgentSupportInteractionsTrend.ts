import {
    fetchTrendFromMultipleMetricsTrend,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { AIAgentInteractionsBySkillMeasure } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { aiAgentSupportInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAiAgentSupportInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        aiAgentSupportInteractionsQueryFactory,
        AIAgentInteractionsBySkillMeasure.Count,
    )

export const fetchAiAgentSupportInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        aiAgentSupportInteractionsQueryFactory,
        AIAgentInteractionsBySkillMeasure.Count,
    )
