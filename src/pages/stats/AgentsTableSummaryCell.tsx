import React from 'react'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {MetricFormat, MetricQueryHook} from 'pages/stats/AgentsTableConfig'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {TableColumn} from 'state/ui/stats/types'

export const AGENT_SUMMARY_CELL_LABEL = 'Average'

export const AgentsTableSummaryCell = ({
    useMetric,
    column,
}: {
    useMetric: MetricQueryHook
    column: TableColumn
}) => {
    const {format, perAgent} = MetricFormat[column]
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const agents = useAppSelector(getSortedAgents)

    const {data, isFetching} = useMetric(cleanStatsFilters, userTimezone)
    const metricValue =
        perAgent && data?.value ? data.value / agents.length : data?.value

    if (column === TableColumn.AgentName) {
        return <>{AGENT_SUMMARY_CELL_LABEL}</>
    }

    return (
        <>
            {isFetching ? (
                <Skeleton inline />
            ) : (
                formatMetricValue(
                    metricValue,
                    format,
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </>
    )
}
