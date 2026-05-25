import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { allAgentsAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useAiAgentAllAgentsAutomatedInteractionsTrend = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const { isFetching, isError, data } = useStatsMetricTrend(
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
    )

    return {
        isFetching,
        isError,
        data: {
            label: 'Automated interactions',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}

export const fetchAiAgentAllAgentsAutomatedInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters,
            timezone,
        }),
        allAgentsAutomatedInteractionsValueQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
