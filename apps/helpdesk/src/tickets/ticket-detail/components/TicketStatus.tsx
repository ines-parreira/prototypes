import {
    Ticket,
    TicketCompact,
    TicketStatus as TicketStatusType,
} from '@gorgias/helpdesk-types'

import { StatusLabel } from 'pages/common/utils/labels'

export function TicketStatus({ ticket }: { ticket: Ticket | TicketCompact }) {
    return (
        <StatusLabel
            status={
                ticket.snooze_datetime
                    ? 'snoozed'
                    : ticket.status || TicketStatusType.Open
            }
        />
    )
}
