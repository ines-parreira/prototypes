import useMetricTrend from 'hooks/reporting/useMetricTrend'
import { searchRequested } from 'models/reporting/queryFactories/help-center/searchRequested'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

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
