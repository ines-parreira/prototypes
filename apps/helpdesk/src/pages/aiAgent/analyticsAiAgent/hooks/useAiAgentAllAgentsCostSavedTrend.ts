import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { allAgentsAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useAiAgentAllAgentsCostSavedTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const trend = useStatsMetricTrend(
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: filteredFilters,
            timezone,
        }),
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: {
                ...filteredFilters,
                period: getPreviousPeriod(filteredFilters.period),
            },
            timezone,
        }),
    )

    return {
        ...trend,
        data: formatCostSavedData(trend, costSavedPerInteraction),
    }
}

export const fetchAiAgentAllAgentsCostSavedTrend: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => {
    const filteredFilters = applyAiAgentFilter(statsFilters, aiAgentUserId)

    const automatedInteractionTrend = await fetchStatsMetricTrend(
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: filteredFilters,
            timezone: userTimezone,
        }),
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: {
                ...filteredFilters,
                period: getPreviousPeriod(filteredFilters.period),
            },
            timezone: userTimezone,
        }),
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
