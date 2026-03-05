import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentHandoverInteractionsV2QueryFactory } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentAllAgentsHandoverInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        aiAgentHandoverInteractionsV2QueryFactory({ filters, timezone }),
        aiAgentHandoverInteractionsV2QueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchAiAgentAllAgentsHandoverInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        aiAgentHandoverInteractionsV2QueryFactory({ filters, timezone }),
        aiAgentHandoverInteractionsV2QueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
