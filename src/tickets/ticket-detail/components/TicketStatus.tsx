import {
    Ticket,
    TicketStatus as TicketStatusType,
    TicketSummary,
} from '@gorgias/api-types'

import { StatusLabel } from 'pages/common/utils/labels'

export function TicketStatus({ ticket }: { ticket: Ticket | TicketSummary }) {
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
