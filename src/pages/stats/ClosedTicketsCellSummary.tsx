import React from 'react'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCleanStatsFiltersWithTimezone,
    getSortedAgents,
} from 'state/ui/stats/agentPerformanceSlice'

export const ClosedTicketsCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const agents = useAppSelector(getSortedAgents)

    const {data, isFetching} = useClosedTicketsMetric(
        cleanStatsFilters,
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
                    'integer',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
