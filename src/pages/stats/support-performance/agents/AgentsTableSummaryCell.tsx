import React from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { StatsFilters } from 'models/stat/types'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    AgentsColumnConfig,
    averageTooltip,
    MetricQueryHook,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn } from 'state/ui/stats/types'

export const AGENT_SUMMARY_CELL_LABEL = 'Average'

export const AgentsTableSummaryCell = ({
    useMetric,
    column,
    statsFilters,
    agentsLength,
}: {
    useMetric: MetricQueryHook
    column: AgentsTableColumn
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    }
    agentsLength: number
}) => {
    const { format, perAgent } = AgentsColumnConfig[column]

    const { data, isFetching } = useMetric(
        statsFilters.cleanStatsFilters,
        statsFilters.userTimezone,
    )

    const metricValue =
        perAgent && data?.value ? data.value / agentsLength : data?.value

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
                    NOT_AVAILABLE_PLACEHOLDER,
                )
            )}
        </>
    )
}
