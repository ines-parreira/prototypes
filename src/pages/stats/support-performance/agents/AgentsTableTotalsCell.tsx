import React from 'react'

import { HintTooltip } from 'pages/stats/common/HintTooltip'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { AgentsColumnConfig } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn } from 'state/ui/stats/types'

export type AgentsTableTotalsCellProps = {
    data:
        | {
              value: number | null
          }
        | undefined
    column: AgentsTableColumn
}

const tooltip = {
    title: 'Total is calculated based on quantity of tickets assigned to agents, while excluding unassigned tickets.',
}

export const AGENT_TOTAL_ROW_LABEL = 'Total'

export const AgentsTableTotalsCell = ({
    data,
    column,
}: AgentsTableTotalsCellProps) => {
    if (column === AgentsTableColumn.AgentName) {
        return (
            <>
                {AGENT_TOTAL_ROW_LABEL} <HintTooltip {...tooltip} />
            </>
        )
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
