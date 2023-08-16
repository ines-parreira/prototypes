import React from 'react'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    getCleanStatsFiltersWithTimezone,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'

export const PercentageOfClosedTicketsCellContent = ({
    agentId,
}: {
    agentId: number
}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = usePercentageOfClosedTicketsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agentId)
    )

    return (
        <>
            {isFetching || isMetricLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : (
                formatMetricValue(
                    data?.value,
                    'percent',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
