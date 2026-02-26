import { formatDuration, NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'
import classNames from 'classnames'

import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import {
    getColumnAlignment,
    getColumnWidth,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import rowCss from 'domains/reporting/pages/support-performance/agents/AgentsSummaryRow.less'
import { TableRowLabels } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import {
    calculateAverage,
    calculateTotal,
} from 'domains/reporting/pages/support-performance/agents/utils'
import type { AgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

const { AGENT_NAME_COLUMN } = AGENT_AVAILABILITY_COLUMNS

type AgentAvailabilitySummaryRowProps = {
    row: 'total' | 'average'
    agents: AgentAvailabilityData[]
    columnsOrder: AgentAvailabilityColumn[]
    isTableScrolled: boolean
    isEmphasized?: boolean
}

const totalTooltip = {
    title: 'Total is calculated based on all agents in the selected period.',
}

const averageTooltip = {
    title: 'Average is calculated based on the mean time across all agents in the selected period.',
    link: 'https://link.gorgias.com/a6l',
}

export const AgentAvailabilitySummaryRow = ({
    row,
    agents,
    columnsOrder,
    isTableScrolled,
    isEmphasized = false,
}: AgentAvailabilitySummaryRowProps) => {
    const calculator = row === 'total' ? calculateTotal : calculateAverage
    const tooltip = row === 'total' ? totalTooltip : averageTooltip

    return (
        <TableBodyRow key={row}>
            {columnsOrder.map((column, index) => {
                const isFirstColumn = column === AGENT_NAME_COLUMN

                const value = calculator(agents, column)
                return (
                    <BodyCell
                        key={column}
                        width={getColumnWidth(column)}
                        isHighlighted
                        justifyContent={getColumnAlignment(column)}
                        className={classNames(css.BodyCell, css.highlight, {
                            [css.withShadow]: index === 0 && isTableScrolled,
                        })}
                        innerClassName={classNames(
                            css.BodyCellContent,
                            isEmphasized && css.bold,
                        )}
                    >
                        {isFirstColumn ? (
                            <>
                                {TableRowLabels[row]}
                                <HintTooltip
                                    {...tooltip}
                                    className={rowCss.leadCellTooltip}
                                />
                            </>
                        ) : (
                            <>
                                {value
                                    ? formatDuration(value, 2)
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </>
                        )}
                    </BodyCell>
                )
            })}
        </TableBodyRow>
    )
}
