import {
    fetchTrendFromMultipleMetricsTrend,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { aiAgentAutomatedInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAIAgentAutomatedInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        aiAgentAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
    )

export const fetchAIAgentAutomatedInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        aiAgentAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
    )
