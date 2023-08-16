import React from 'react'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {useTicketsRepliedMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    getCleanStatsFiltersWithTimezone,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'

export const TicketsRepliedCellContent = ({agentId}: {agentId: number}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useTicketsRepliedMetricPerAgent(
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
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
