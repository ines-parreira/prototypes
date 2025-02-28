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
    MetricQueryHook,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn } from 'state/ui/stats/types'

export type AgentsTableTotalsCellProps = {
    useMetric: MetricQueryHook
    column: AgentsTableColumn
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    }
}

const tooltip = {
    title: 'Total is calculated based on quantity of tickets assigned to agents, while excluding unassigned tickets.',
}

export const AGENT_TOTAL_ROW_LABEL = 'Total'

export const AgentsTableTotalsCell = ({
    useMetric,
    column,
    statsFilters,
}: AgentsTableTotalsCellProps) => {
    const { data, isFetching } = useMetric(
        statsFilters.cleanStatsFilters,
        statsFilters.userTimezone,
    )

    if (column === AgentsTableColumn.AgentName) {
        return (
            <>
                {AGENT_TOTAL_ROW_LABEL} <HintTooltip {...tooltip} />
            </>
        )
    }

    if (isFetching) {
        return <Skeleton inline />
    }

    return (
        <>
            {formatMetricValue(
                data?.value,
                AgentsColumnConfig[column].format,
                NOT_AVAILABLE_PLACEHOLDER,
            )}
        </>
    )
}
