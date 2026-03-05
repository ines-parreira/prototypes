import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { handoverInteractionsV2QueryFactory } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useHandoverInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        handoverInteractionsV2QueryFactory({ filters, timezone }),
        handoverInteractionsV2QueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchHandoverInteractionsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        handoverInteractionsV2QueryFactory({ filters, timezone }),
        handoverInteractionsV2QueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
