import React from 'react'
import {useResolutionTimeMetric} from 'hooks/reporting/metrics'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const ResolutionTimeCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {data, isFetching} = useResolutionTimeMetric(
        cleanStatsFilters,
        userTimezone
    )

    const metricValue = data?.value

    return (
        <>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    metricValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
