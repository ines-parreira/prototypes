import { DataTableBaseCell, Icon, Tag } from '@gorgias/axiom'
import type { Color } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { PRIORITY_ICON_MAP } from '../../../../components/TicketPriority/components/PrioritySelect'

const PRIORITY_LABEL: Record<string, string> = {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    critical: 'Critical',
}

type Props = {
    ticket: TicketCompact
}

export function PriorityCell({ ticket }: Props) {
    const priority = ticket.priority ?? 'normal'
    const { icon, color } =
        PRIORITY_ICON_MAP[priority as keyof typeof PRIORITY_ICON_MAP]

    return (
        <DataTableBaseCell>
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
