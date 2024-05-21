import {useMemo} from 'react'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import {ReportingGranularity} from 'models/reporting/types'
import {getAggregatedBusiestTimesOfDayData} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

export const useAggregatedBusiestTimesOfDayData = (
    useMetricQuery: TimeSeriesHook
) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const data = useMetricQuery(
        cleanStatsFilters,
        userTimezone,
        ReportingGranularity.Hour
    )
    const {btodData, max} = useMemo(
        () => getAggregatedBusiestTimesOfDayData(data?.data, userTimezone),
        [data?.data, userTimezone]
    )

    return {
        btodData,
        max,
        isLoading: data.isLoading,
        period: cleanStatsFilters.period,
        userTimezone,
    }
}
