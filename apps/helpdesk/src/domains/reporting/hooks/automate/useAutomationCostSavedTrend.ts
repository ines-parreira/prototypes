import type {
    MetricTrend,
    MetricTrendFetch,
} from 'domains/reporting/hooks/useMetricTrend'
import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
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
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const trend = useStatsMetricTrend(
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
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

export const fetchAutomationCostSavedTrend: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    _aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => {
    const automatedInteractionTrend = await fetchStatsMetricTrend(
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
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
