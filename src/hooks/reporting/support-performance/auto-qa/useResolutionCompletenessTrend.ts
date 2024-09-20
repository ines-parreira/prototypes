import useMetricTrend from 'hooks/reporting/useMetricTrend'
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
