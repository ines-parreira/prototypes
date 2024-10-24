import {useMemo} from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import {ReportingGranularity} from 'models/reporting/types'
import {getAggregatedBusiestTimesOfDayData} from 'pages/stats/support-performance/busiest-times-of-days/utils'

export const useAggregatedBusiestTimesOfDayData = (
    useMetricQuery: TimeSeriesHook
) => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

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
