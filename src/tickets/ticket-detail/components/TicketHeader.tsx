import { ReactNode } from 'react'

import type { Ticket, TicketCompact } from '@gorgias/api-queries'

import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import TicketFields from 'timeline/TicketFields'

import { SourceBadge } from './SourceBadge'
import { TicketAssignee } from './TicketAssignee'
import { TicketStatus } from './TicketStatus'

import css from './TicketHeader.less'

type Props = {
    ticket: Ticket | TicketCompact
    additionalActions?: ReactNode
}

export function TicketHeader({ ticket, additionalActions }: Props) {
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

                {!!additionalActions && (
                    <div className={css.actions}>{additionalActions}</div>
                )}
            </header>
            <div className={css.tagsAndAssignee}>
                {ticket.tags.length > 0 ? (
                    <TicketTags ticketTags={ticket.tags} isDisabled />
                ) : (
                    <span className={css.noTags}>No tags yet</span>
                )}
                <div className={css.assignee}>
                    <TicketAssignee
                        assignedAgent={ticket.assignee_user}
                        assignedTeam={ticket.assignee_team}
                    />
                </div>
            </div>
            <TicketFields
                fieldValues={ticket.custom_fields}
                isMultiline
                isBold
            />
        </div>
    )
}
