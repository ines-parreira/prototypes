import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { accuracyQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/accuracyQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAccuracyTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        accuracyQueryFactory(filters, timezone),
        accuracyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchAccuracyTrend = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        accuracyQueryFactory(filters, timezone),
        accuracyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
