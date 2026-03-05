import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiSupportHandoverInteractionsV2QueryFactory } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentSupportHandoverInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        aiSupportHandoverInteractionsV2QueryFactory({ filters, timezone }),
        aiSupportHandoverInteractionsV2QueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchAiAgentSupportHandoverInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        aiSupportHandoverInteractionsV2QueryFactory({ filters, timezone }),
        aiSupportHandoverInteractionsV2QueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
