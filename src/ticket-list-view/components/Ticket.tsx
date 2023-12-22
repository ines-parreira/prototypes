import cn from 'classnames'
import moment from 'moment'
import React from 'react'
import {Link} from 'react-router-dom'

import {TicketStatus} from 'business/types/ticket'
import TicketIcon from 'pages/common/components/TicketIcon'

import {TicketPartial, TicketSummary} from '../types'
import css from './Ticket.less'

type Props = {
    stale: boolean
    ticket: TicketPartial | TicketSummary
    viewId: number
}

export default function Ticket({ticket, viewId}: Props) {
    return (
        <div className={css.outer}>
            <Link
                className={css.inner}
                to={`/app/views/${viewId}/${ticket.id}`}
            >
                {!('channel' in ticket) ? (
                    <p>skeleton</p>
                ) : (
                    <>
                        <TicketIcon
                            channel={ticket.channel}
                            className={css.icon}
                            isOpen={ticket.status === TicketStatus.Open}
                        />
                        <div
                            className={cn(css.content, {
                                [css.unread]: ticket.is_unread,
                            })}
                        >
                            <div className={css.wrapper}>
                                <div className={css.subject}>
                                    {ticket.subject}
                                </div>
                                {ticket.is_unread && (
                                    <div className={css.counter} />
                                )}
                            </div>
                            <div className={cn(css.wrapper, css.body)}>
                                <div className={css.excerpt}>
                                    {ticket.excerpt}
                                </div>
                                <div className={css.time}>
                                    {moment(
                                        ticket.last_message_datetime
                                    ).fromNow()}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Link>
        </div>
    )
}
