import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { supportAgentAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useAiAgentSupportAgentAutomatedInteractionsTrend = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const { isFetching, isError, data } = useStatsMetricTrend(
        supportAgentAutomatedInteractionsValueQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        supportAgentAutomatedInteractionsValueQueryFactoryV2({
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

export const fetchAiAgentSupportAgentAutomatedInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        supportAgentAutomatedInteractionsValueQueryFactoryV2({
            filters,
            timezone,
        }),
        supportAgentAutomatedInteractionsValueQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
