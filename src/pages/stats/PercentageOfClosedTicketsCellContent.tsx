import React from 'react'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {isSortingMetricLoading} from 'state/ui/stats/agentPerformanceSlice'

export const PercentageOfClosedTicketsCellContent = ({
    agentId,
}: {
    agentId: number
}) => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = usePercentageOfClosedTicketsMetricPerAgent(
        pageStatsFilters,
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
