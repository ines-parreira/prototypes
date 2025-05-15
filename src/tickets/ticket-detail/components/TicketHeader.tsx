import { FC } from 'react'

import type { Ticket, TicketCompact } from '@gorgias/api-queries'

import { SourceBadge } from './SourceBadge'
import { TicketStatus } from './TicketStatus'

import css from './TicketHeader.less'

type Props = {
    ticket: Ticket | TicketCompact
    AdditionalAction?: FC
}

export function TicketHeader({ ticket, AdditionalAction }: Props) {
    return (
        <div className={css.container}>
            <header className={css.header}>
                <SourceBadge channel={ticket.channel} />
                <div className={css.subjectWrapper}>
                    <div className={css.subjectInner}>
                        <h2 className={css.subject}>{ticket.subject}</h2>
                        <TicketStatus ticket={ticket} />
                    </div>
                    <p className={css.ticketId}>ID: {ticket.id}</p>
                </div>

                {!!AdditionalAction && (
                    <div className={css.actions}>{<AdditionalAction />}</div>
                )}
            </header>

            <pre>
                {JSON.stringify({
                    tags: ticket.tags,
                    assignee_team: ticket.assignee_team,
                    assignee_user: ticket.assignee_user,
                    custom_fields: ticket.custom_fields,
                })}
            </pre>
        </div>
    )
}
