import type { Ticket } from '@gorgias/helpdesk-types'

import { RelativeTime } from 'pages/common/components/RelativeTime'

import { getReferenceVisual } from '../../icons'
import {
    ReferenceCardRow,
    ReferenceCardShell,
} from '../shared/ReferenceCardShell'
import { getTicketStatusTag } from './status'

const VISUAL = getReferenceVisual('ticket')

type Props = {
    ticket: Ticket
}

export function TicketReferenceCardView({ ticket }: Props) {
    const customer = ticket.customer
    const customerLabel =
        customer.name ||
        [customer.firstname, customer.lastname].filter(Boolean).join(' ') ||
        customer.email ||
        null

    return (
        <ReferenceCardShell
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
            eyebrow={`#${ticket.id}`}
            title={ticket.subject || 'Untitled ticket'}
            statusTag={getTicketStatusTag(ticket.status)}
            rows={
                <>
                    {customerLabel ? (
                        <ReferenceCardRow icon="user">
                            {customerLabel}
                        </ReferenceCardRow>
                    ) : null}
                    <ReferenceCardRow icon="clock">
                        Updated{' '}
                        <RelativeTime
                            datetime={
                                ticket.updated_datetime ??
                                ticket.created_datetime
                            }
                        />
                    </ReferenceCardRow>
                </>
            }
        />
    )
}
