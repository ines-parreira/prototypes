import type { MetricTrend } from '@repo/reporting'

import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useAiAgentSupportCostSaved = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const trend = useStatsMetricTrend(
        dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
    )

    return {
        ...trend,
        data: formatCostSavedData(trend, costSavedPerInteraction),
    }
}

export const fetchAiAgentSupportCostSaved: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    _aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => {
    const automatedInteractionTrend = await fetchStatsMetricTrend(
        dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
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
