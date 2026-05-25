import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { shoppingAssistantAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useAiAgentShoppingAssistantAutomatedInteractionsTrend = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const { isFetching, isError, data } = useStatsMetricTrend(
        shoppingAssistantAutomatedInteractionsValueQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        shoppingAssistantAutomatedInteractionsValueQueryFactoryV2({
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

export const fetchAiAgentShoppingAssistantAutomatedInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        shoppingAssistantAutomatedInteractionsValueQueryFactoryV2({
            filters,
            timezone,
        }),
        shoppingAssistantAutomatedInteractionsValueQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
