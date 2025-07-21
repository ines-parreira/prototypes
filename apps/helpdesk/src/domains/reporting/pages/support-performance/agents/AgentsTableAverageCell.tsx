import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import css from 'domains/reporting/pages/support-performance/agents/AgentsSummaryRow.less'
import {
    AgentsColumnConfig,
    averageTooltip,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'

export const AGENT_SUMMARY_CELL_LABEL = 'Average'

type AgentsTableSummaryCellProps = {
    data:
        | {
              value: number | null
          }
        | undefined
    column: AgentsTableColumn
    agentsLength: number
}

export const AgentsTableAverageCell = ({
    column,
    agentsLength,
    data,
}: AgentsTableSummaryCellProps) => {
    const { format, perAgent } = AgentsColumnConfig[column]

    const metricValue =
        perAgent && data?.value ? data.value / agentsLength : data?.value

    if (column === AgentsTableColumn.AgentName) {
        return (
            <>
                {AGENT_SUMMARY_CELL_LABEL}
                <HintTooltip
                    {...averageTooltip}
                    className={css.leadCellTooltip}
                />
            </>
        )
    }

    return (
        <>{formatMetricValue(metricValue, format, NOT_AVAILABLE_PLACEHOLDER)}</>
    )
}
