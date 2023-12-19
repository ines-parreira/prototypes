import React from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {useMedianFirstResponseTimeMetric} from 'hooks/reporting/metrics'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const MedianFirstResponseTimeCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {data, isFetching} = useMedianFirstResponseTimeMetric(
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
