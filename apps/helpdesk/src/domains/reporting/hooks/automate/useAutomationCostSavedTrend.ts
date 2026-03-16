import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import type {
    MetricTrend,
    MetricTrendFetch,
} from 'domains/reporting/hooks/useMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const formatCostSavedData = (
    automatedInteractionTrend: MetricTrend,
    costSavedPerInteraction: number,
) => {
    return {
        value:
            (automatedInteractionTrend.data?.value ?? 0) *
            costSavedPerInteraction,
        prevValue:
            (automatedInteractionTrend.data?.prevValue ?? 0) *
            costSavedPerInteraction,
    }
}

export const useAutomationCostSavedTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    const automatedInteractionTrend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
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

export const fetchAutomationCostSavedTrend: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    _aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => {
    return fetchFilteredAutomatedInteractions(statsFilters, userTimezone).then(
        (result) => ({
            data: formatCostSavedData(result, costSavedPerInteraction),
            isFetching: false,
            isError: false,
        }),
    )
}
