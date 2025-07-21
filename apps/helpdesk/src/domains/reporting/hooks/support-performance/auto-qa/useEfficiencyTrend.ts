import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { efficiencyQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/efficiencyQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useEfficiencyTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        efficiencyQueryFactory(filters, timezone),
        efficiencyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchEfficiencyTrend = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        efficiencyQueryFactory(filters, timezone),
        efficiencyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
