import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { accuracyQueryFactory } from 'models/reporting/queryFactories/auto-qa/accuracyQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

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
