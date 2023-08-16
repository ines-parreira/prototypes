import React from 'react'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {useFirstResponseTimeMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCleanStatsFiltersWithTimezone,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const FirstResponseTimeCellContent = ({agentId}: {agentId: number}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useFirstResponseTimeMetricPerAgent(
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
