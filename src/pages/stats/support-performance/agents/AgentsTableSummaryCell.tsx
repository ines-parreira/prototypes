import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
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
    statsFilters,
}: {
    useMetric: MetricQueryHook
    column: AgentsTableColumn
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    }
}) => {
    const {format, perAgent} = AgentsColumnConfig[column]
    const agents = useAppSelector(getSortedAgents)

    const {data, isFetching} = useMetric(
        statsFilters.cleanStatsFilters,
        statsFilters.userTimezone
    )
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
