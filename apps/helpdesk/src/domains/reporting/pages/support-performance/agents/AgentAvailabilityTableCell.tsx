import {
    formatDuration as formatDurationBase,
    NOT_AVAILABLE_PLACEHOLDER,
} from '@repo/reporting'
import classNames from 'classnames'

import { Box, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import {
    getColumnAlignment,
    getColumnWidth,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import type { StatusBreakdown } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

const { AVAILABLE_STATUS_COLUMN } = AGENT_AVAILABILITY_COLUMNS

export function getColumnValue(
    columnData: number | StatusBreakdown | undefined,
    column?: AgentAvailabilityColumn,
): number | undefined {
    if (columnData === undefined || columnData === null) return undefined
    if (typeof columnData === 'number') return columnData
    // For Available column, show only online time (not total which includes offline)
    if (column === AVAILABLE_STATUS_COLUMN) {
        return columnData.online
    }
    return columnData.total
}

export function isStatusBreakdown(
    columnData: number | StatusBreakdown | undefined,
): columnData is StatusBreakdown {
    return (
        typeof columnData === 'object' &&
        columnData !== null &&
        'total' in columnData
    )
}

function StatusBreakdownTooltip({ breakdown }: { breakdown: StatusBreakdown }) {
    return (
        <Box flexDirection="column" gap="xxs">
            <Text size="sm">
                Online: {formatDurationBase(breakdown.online, 2)}
            </Text>
            <Text size="sm">
                Offline: {formatDurationBase(breakdown.offline, 2)}
            </Text>
        </Box>
    )
}

type AgentAvailabilityTableCellProps = {
    column: AgentAvailabilityColumn
    columnData: number | StatusBreakdown | undefined
    isTableScrolled: boolean
    columnIndex: number
}

export function AgentAvailabilityTableCell({
    column,
    columnData,
    isTableScrolled,
    columnIndex,
}: AgentAvailabilityTableCellProps) {
    const value = getColumnValue(columnData, column)
    const hasBreakdown = isStatusBreakdown(columnData)

    // Show "-" if value is 0 or undefined
    const displayValue =
        value && value > 0
            ? formatDurationBase(value, 2)
            : NOT_AVAILABLE_PLACEHOLDER

    const cellContent = <div>{displayValue}</div>

    return (
        <BodyCell
            key={column}
            width={getColumnWidth(column)}
            justifyContent={getColumnAlignment(column)}
            className={classNames(css.BodyCell, {
                [css.withShadow]: columnIndex === 0 && isTableScrolled,
            })}
            innerClassName={css.BodyCellContent}
        >
            {hasBreakdown && value && value > 0 ? (
                <Tooltip trigger={cellContent}>
                    <TooltipContent>
                        <StatusBreakdownTooltip breakdown={columnData} />
                    </TooltipContent>
                </Tooltip>
            ) : (
                cellContent
            )}
        </BodyCell>
    )
}
