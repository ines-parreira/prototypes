import React from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {useFirstResponseTimeMetric} from 'hooks/reporting/metrics'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const FirstResponseTimeCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {data, isFetching} = useFirstResponseTimeMetric(
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
