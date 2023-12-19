import React from 'react'
import {useOneTouchTicketsMetric} from 'hooks/reporting/metrics'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const OneTouchTicketsCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const agents = useAppSelector(getSortedAgents)
    const {data, isFetching} = useOneTouchTicketsMetric(
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
                    'percent',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
