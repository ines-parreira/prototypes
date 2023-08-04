import React from 'react'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {isSortingMetricLoading} from 'state/ui/stats/agentPerformanceSlice'

export const ClosedTicketsCellContent = ({agentId}: {agentId: number}) => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useClosedTicketsMetricPerAgent(
        pageStatsFilters,
        userTimezone,
        undefined,
        String(agentId)
    )
    const metricValue = data?.value

    return (
        <BodyCellContent>
            {isFetching || isMetricLoading ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    metricValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCellContent>
    )
}
