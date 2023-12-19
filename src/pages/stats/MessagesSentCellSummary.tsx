import React from 'react'
import {useMessagesSentMetric} from 'hooks/reporting/metrics'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const MessagesSentCellSummary = () => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const agents = useAppSelector(getSortedAgents)

    const {data, isFetching} = useMessagesSentMetric(
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
