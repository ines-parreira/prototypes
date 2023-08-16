import React from 'react'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCleanStatsFiltersWithTimezone,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'

export const ClosedTicketsCellContent = ({agentId}: {agentId: number}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useClosedTicketsMetricPerAgent(
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
