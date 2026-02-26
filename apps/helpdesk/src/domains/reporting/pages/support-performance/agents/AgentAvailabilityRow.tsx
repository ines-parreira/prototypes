import classNames from 'classnames'

import type { User } from 'config/types/user'
import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import { AgentAvailabilityTableCell } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableCell'
import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import {
    getColumnAlignment,
    getColumnWidth,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AgentNameCellContent } from 'domains/reporting/pages/support-performance/agents/AgentNameCellContent'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import type {
    AgentAvailabilityData,
    StatusBreakdown,
} from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

type AgentAvailabilityRowProps = {
    agent: AgentAvailabilityData
    columnsOrder: AgentAvailabilityColumn[]
    isTableScrolled: boolean
}

export function AgentAvailabilityRow({
    agent,
    columnsOrder,
    isTableScrolled,
}: AgentAvailabilityRowProps) {
    const userAgent: User = {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        meta: agent.avatarUrl ? { profile_picture_url: agent.avatarUrl } : {},
    } as User

    return (
        <TableBodyRow>
            {columnsOrder.map((column, index) => {
                const isFirstColumn =
                    column === AGENT_AVAILABILITY_COLUMNS.AGENT_NAME_COLUMN

                if (isFirstColumn) {
                    return (
                        <AgentNameCellContent
                            key={column}
                            agent={userAgent}
                            bodyCellProps={{
                                width: getColumnWidth(column),
                                justifyContent: getColumnAlignment(column),
                                className: classNames(css.BodyCell, {
                                    [css.withShadow]:
                                        index === 0 && isTableScrolled,
                                }),
                                innerClassName: css.BodyCellContent,
                            }}
                        />
                    )
                }

                return (
                    <AgentAvailabilityTableCell
                        key={column}
                        column={column}
                        columnData={
                            agent[column] as
                                | number
                                | StatusBreakdown
                                | undefined
                        }
                        isTableScrolled={isTableScrolled}
                        columnIndex={index}
                    />
                )
            })}
        </TableBodyRow>
    )
}
