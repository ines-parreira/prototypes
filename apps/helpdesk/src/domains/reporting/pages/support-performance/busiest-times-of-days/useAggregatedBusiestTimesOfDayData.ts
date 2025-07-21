import { useMemo } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TimeSeriesHook } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getAggregatedBusiestTimesOfDayData } from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'

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
