import type { ReactNode } from 'react'

import cn from 'classnames'

import { TicketCompact, TicketPriority } from '@gorgias/helpdesk-types'

import { PriorityLabel } from 'pages/tickets/common/components/PriorityLabel'
import { SourceBadge } from 'tickets/ticket-detail/components/SourceBadge'
import { TicketStatus } from 'tickets/ticket-detail/components/TicketStatus'

import { OwnerLabel } from './OwnerLabel'
import TicketFields from './TicketFields'

import css from './TicketCard.less'

type Props = {
    className?: string
    ticket: TicketCompact
    displayedDate: ReactNode
    isHighlighted?: boolean
}

export default function TicketCard({
    ticket,
    isHighlighted = false,
    displayedDate,
    className,
}: Props) {
    return (
        <div
            className={cn(css.card, className, {
                [css.highlight]: isHighlighted,
            })}
        >
            <SourceBadge channel={ticket.channel} size="small" />
            <div className={css.content}>
                <div className={css.heading}>
                    <span className={css.title}>
                        <span className={css.subject}>{ticket.subject}</span>
                        <TicketStatus ticket={ticket} />
                        <PriorityLabel
                            priority={ticket.priority as TicketPriority}
                            displayLabel={false}
                            hasTooltip
                        />
                    </span>
                    <span className={css.date}>{displayedDate}</span>
                </div>
                <TicketFields
                    fieldValues={ticket.custom_fields}
                    ticket={ticket}
                    className={css.ticketFields}
                />
                <div className={css.meta}>
                    <OwnerLabel
                        type="agent"
                        owner={ticket.assignee_user?.name}
                    />
                    <span className={css.separator}>•</span>
                    <OwnerLabel
                        type="team"
                        owner={ticket.assignee_team?.name}
                    />
                    <span className={css.separator}>•</span>
                    <span className={css.metaText}>ID: {ticket.id}</span>
                    <span className={css.separator}>•</span>
                    <span className={css.metaText}>
                        {ticket.messages_count} message
                        {ticket.messages_count > 1 && 's'}
                    </span>
                </div>
            </div>
        </div>
    )
}
