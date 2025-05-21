import { useMemo } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { TimeSeriesHook } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { getAggregatedBusiestTimesOfDayData } from 'pages/stats/support-performance/busiest-times-of-days/utils'

export const useAggregatedBusiestTimesOfDayData = (
    useMetricQuery: TimeSeriesHook,
) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const data = useMetricQuery(
        cleanStatsFilters,
        userTimezone,
        ReportingGranularity.Hour,
    )
    const { btodData, max } = useMemo(
        () => getAggregatedBusiestTimesOfDayData(data?.data, userTimezone),
        [data?.data, userTimezone],
    )

    return {
        btodData,
        max,
        isLoading: data.isFetching,
        period: cleanStatsFilters.period,
        userTimezone,
    }
}
