import React from 'react'

import cn from 'classnames'

import { TicketSummary } from '@gorgias/api-queries'
import { TicketStatus } from '@gorgias/api-types'

import { logEvent, SegmentEvent } from 'common/segment'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { StatusLabel } from 'pages/common/utils/labels'
import history from 'pages/history'
import { handleButtonLikeClick } from 'utils/accessibility'

import { OwnerLabel } from './OwnerLabel'
import { SourceBadge } from './SourceBadge'

import css from './TicketCard.less'

type Props = {
    ticket: TicketSummary
    onClick?: (ticketId: number) => void
    isHighlighted?: boolean
}

export default function TicketCard({
    ticket,
    onClick,
    isHighlighted = false,
}: Props) {
    return (
        <div
            className={cn(css.card, {
                [css.highlight]: isHighlighted,
            })}
            {...handleButtonLikeClick((evt) => {
                evt.preventDefault()
                onClick?.(ticket.id)
                logEvent(SegmentEvent.CustomerTimelineTicketClicked)
                history.push(`/app/ticket/${ticket.id}`)
            })}
        >
            <SourceBadge channel={ticket.channel} />
            <div className={css.content}>
                <div className={css.heading}>
                    <span className={css.title}>
                        <span className={css.subject}>{ticket.subject}</span>
                        <StatusLabel
                            status={
                                ticket.snooze_datetime
                                    ? 'snoozed'
                                    : ticket.status || TicketStatus.Open
                            }
                        />
                    </span>
                    <DatetimeLabel
                        dateTime={
                            ticket.last_message_datetime ||
                            ticket.created_datetime
                        }
                    />
                </div>
                <div className={css.excerpt}>{ticket.excerpt}</div>
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
                    ID: {ticket.id}
                    <span className={css.separator}>•</span>
                    {ticket.messages_count} message
                    {ticket.messages_count > 1 && 's'}
                </div>
            </div>
        </div>
    )
}
