import React from 'react'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

export const PercentageOfClosedTicketsCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const agents = useAppSelector(getSortedAgents)

    const {isFetching} = useClosedTicketsMetric(cleanStatsFilters, userTimezone)

    const metricValue = 100 / agents.length

    return (
        <>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    metricValue,
                    'percent',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
