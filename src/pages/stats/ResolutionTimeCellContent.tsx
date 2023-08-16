import React from 'react'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {useResolutionTimeMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {
    getCleanStatsFiltersWithTimezone,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const ResolutionTimeCellContent = ({agentId}: {agentId: number}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useResolutionTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agentId)
    )
    const metricValue = data?.value

    return (
        <>
            {isFetching || isMetricLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
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
