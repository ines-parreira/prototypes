import React from 'react'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useTicketsRepliedMetric} from 'hooks/reporting/metrics'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'

export const TicketsRepliedCellSummary = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const agents = useAppSelector(getSortedAgents)

    const {data, isFetching} = useTicketsRepliedMetric(
        pageStatsFilters,
        userTimezone
    )
    const metricValue = data?.value ? data.value / agents.length : data?.value

    return (
        <>
            {isFetching ? (
                <Skeleton inline />
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
