import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'hooks/reporting/automate/automationTrends'
import { MetricTrend, MetricTrendFetch } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const formatData = (
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
        data: formatData(automatedInteractionTrend, costSavedPerInteraction),
    }
}

export const fetchAutomationCostSavedTrend: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    _isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined,
    _aiAgentUserId: string | undefined,
    costSavedPerInteraction: number,
) => {
    return fetchFilteredAutomatedInteractions(statsFilters, userTimezone).then(
        (result) => ({
            data: formatData(result, costSavedPerInteraction),
            isFetching: false,
            isError: false,
        }),
    )
}
