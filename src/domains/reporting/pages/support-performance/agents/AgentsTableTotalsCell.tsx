import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import css from 'domains/reporting/pages/support-performance/agents/AgentsSummaryRow.less'
import { AgentsColumnConfig } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'

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
                {AGENT_TOTAL_ROW_LABEL}
                <HintTooltip {...tooltip} className={css.leadCellTooltip} />
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
