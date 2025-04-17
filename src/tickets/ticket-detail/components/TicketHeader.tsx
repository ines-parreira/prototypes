import type { Ticket, TicketSummary } from '@gorgias/api-queries'
import { IconButton } from '@gorgias/merchant-ui-kit'

import { TicketStatus } from 'business/types/ticket'
import SourceIcon from 'pages/common/components/SourceIcon'
import { StatusLabel } from 'pages/common/utils/labels'

import css from './TicketHeader.less'

type Props = {
    ticket: Ticket | TicketSummary
    onClose?: () => void
}

export function TicketHeader({ ticket, onClose }: Props) {
    return (
        <div className={css.container}>
            <header className={css.header}>
                <div className={css.channel}>
                    <SourceIcon
                        className={css.channelIcon}
                        type={ticket.channel}
                    />
                </div>
                <div className={css.subjectWrapper}>
                    <div className={css.subjectInner}>
                        <h2 className={css.subject}>{ticket.subject}</h2>
                        <StatusLabel
                            status={
                                ticket.snooze_datetime
                                    ? 'snoozed'
                                    : ticket.status || TicketStatus.Open
                            }
                        />
                    </div>
                    <p className={css.ticketId}>ID: {ticket.id}</p>
                </div>

                <div className={css.actions}>
                    {!!onClose && (
                        <IconButton
                            fillStyle="ghost"
                            icon="close"
                            intent="secondary"
                            onClick={onClose}
                        />
                    )}
                </div>
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
