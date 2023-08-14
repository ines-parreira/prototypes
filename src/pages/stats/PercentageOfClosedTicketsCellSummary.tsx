import React from 'react'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'

export const PercentageOfClosedTicketsCellSummary = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const agents = useAppSelector(getSortedAgents)

    const {isFetching} = useClosedTicketsMetric(pageStatsFilters, userTimezone)

    const metricValue = 100 / agents.length

    return (
        <BodyCellContent>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    metricValue,
                    'percent',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCellContent>
    )
}
