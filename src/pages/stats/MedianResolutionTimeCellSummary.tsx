import React from 'react'
import {useMedianResolutionTimeMetric} from 'hooks/reporting/metrics'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const MedianResolutionTimeCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {data, isFetching} = useMedianResolutionTimeMetric(
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
