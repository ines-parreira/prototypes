import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {resolutionCompletenessQueryFactory as resolutionCompletenessQueryFactory} from 'models/reporting/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useResolutionCompletenessTrend = (
    filters: StatsFilters,
    timezone: string
) => {
    const {data, isFetching, isError} = useMetricTrend(
        resolutionCompletenessQueryFactory(filters, timezone),
        resolutionCompletenessQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
    const dataPercentage =
        typeof data?.value === 'number' && typeof data?.prevValue === 'number'
            ? {value: data.value * 100, prevValue: data.prevValue * 100}
            : data

    return {data: dataPercentage, isFetching, isError}
}
