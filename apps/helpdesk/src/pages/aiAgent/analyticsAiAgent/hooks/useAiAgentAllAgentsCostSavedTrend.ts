import {
    fetchTrendFromMultipleMetricsTrend,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { automationDatasetQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { automatedInteractionsQueryV2Factory } from 'domains/reporting/models/scopes/automatedInteractions'
import type { AutomatedInteractionsContext } from 'domains/reporting/models/scopes/automatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

const aiAgentAllAgentsCostSavedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
) => ({
    ...automationDatasetQueryFactory(filters, timezone),
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_COST_SAVED,
})

const aiAgentAllAgentsAutomatedInteractionsQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => ({
    ...automatedInteractionsQueryV2Factory(ctx),
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_AUTOMATED_INTERACTIONS,
})

export const useAiAgentAllAgentsCostSavedTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    const automatedInteractionTrend = useTrendFromMultipleMetricsTrend(
        filteredFilters,
        timezone,
        aiAgentAllAgentsCostSavedQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        aiAgentAllAgentsAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
    )
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    return {
        ...automatedInteractionTrend,
        data: formatCostSavedData(
            automatedInteractionTrend,
            costSavedPerInteraction,
        ),
    }
}

export const fetchAiAgentAllAgentsCostSavedTrend: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => {
    const filteredFilters = applyAiAgentFilter(statsFilters, aiAgentUserId)
    const automatedInteractionTrend = await fetchTrendFromMultipleMetricsTrend(
        filteredFilters,
        userTimezone,
        aiAgentAllAgentsCostSavedQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        aiAgentAllAgentsAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
    )

    return {
        data: formatCostSavedData(
            automatedInteractionTrend,
            costSavedPerInteraction,
        ),
        isFetching: false,
        isError: false,
    }
}
