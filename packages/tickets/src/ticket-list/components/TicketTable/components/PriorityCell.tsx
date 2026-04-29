import { DataTableBaseCell, Icon, Tag } from '@gorgias/axiom'
import type { CellContext, Color } from '@gorgias/axiom'

import { PRIORITY_ICON_MAP } from '../../../../components/TicketPriority/components/PrioritySelect'
import type { TicketTableRow } from '../TicketTableColumns'

const PRIORITY_LABEL: Record<string, string> = {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    critical: 'Critical',
}

export type PriorityCellProps = CellContext<TicketTableRow, unknown>

export function PriorityCell(cellContext: PriorityCellProps) {
    const priority = cellContext.row.original.priority ?? 'normal'
    const { icon, color } =
        PRIORITY_ICON_MAP[priority as keyof typeof PRIORITY_ICON_MAP]

    return (
        <DataTableBaseCell {...cellContext}>
            <Tag
                leadingSlot={
                    <Icon name={icon} size="sm" color={color as Color} />
                }
            >
                {PRIORITY_LABEL[priority] ?? priority}
            </Tag>
        </DataTableBaseCell>
    )
}
