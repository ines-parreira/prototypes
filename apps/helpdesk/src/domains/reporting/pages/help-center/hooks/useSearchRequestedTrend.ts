import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { searchRequested } from 'domains/reporting/models/queryFactories/help-center/searchRequested'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useSearchRequestedTrend = (
    statsFilters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        searchRequested(statsFilters, timezone),
        searchRequested(
            {
                ...statsFilters,
                period: { ...getPreviousPeriod(statsFilters.period) },
            },
            timezone,
        ),
    )
