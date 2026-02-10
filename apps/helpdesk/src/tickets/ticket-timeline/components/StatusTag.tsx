import type { Color as ColorType } from '@gorgias/axiom'
import { Color, Tag } from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

type StatusTagProps = {
    status: Ticket['status']
    isSnoozed: boolean
}

function getStatusInfo(
    isSnoozed: boolean,
    ticketStatus: Ticket['status'],
): {
    label: string
    color: Extract<ColorType, 'grey' | 'blue' | 'purple'>
} {
    if (isSnoozed) {
        return { label: 'Snoozed', color: Color.Blue }
    }
    if (ticketStatus === 'closed') {
        return { label: 'Closed', color: Color.Grey }
    }
    return { label: 'Open', color: Color.Purple }
}

export function StatusTag({ status, isSnoozed }: StatusTagProps) {
    const { label, color } = getStatusInfo(isSnoozed, status)
    return <Tag color={color}>{label}</Tag>
}
