import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {resolutionCompletenessQueryFactory as resolutionCompletenessQueryFactory} from 'models/reporting/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useResolutionCompletenessTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        resolutionCompletenessQueryFactory(filters, timezone),
        resolutionCompletenessQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const fetchResolutionCompletenessTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    fetchMetricTrend(
        resolutionCompletenessQueryFactory(filters, timezone),
        resolutionCompletenessQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
