import React from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {HintTooltip} from 'pages/stats/common/HintTooltip'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    AgentsColumnConfig,
    MetricQueryHook,
    averageTooltip,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {AgentsTableColumn} from 'state/ui/stats/types'

export const AGENT_SUMMARY_CELL_LABEL = 'Average'

export const AgentsTableSummaryCell = ({
    useMetric,
    column,
}: {
    useMetric: MetricQueryHook
    column: AgentsTableColumn
}) => {
    const {format, perAgent} = AgentsColumnConfig[column]
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    const agents = useAppSelector(getSortedAgents)

    const {data, isFetching} = useMetric(cleanStatsFilters, userTimezone)
    const metricValue =
        perAgent && data?.value ? data.value / agents.length : data?.value

    if (column === AgentsTableColumn.AgentName) {
        return (
            <>
                {AGENT_SUMMARY_CELL_LABEL} <HintTooltip {...averageTooltip} />
            </>
        )
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
