import React from 'react'
import classNames from 'classnames'
import moment from 'moment'

import {Link} from 'react-router-dom'
import {TicketStatus} from 'business/types/ticket'
import {Ticket} from 'models/ticket/types'
import TicketIcon from 'pages/common/components/TicketIcon'

import css from './TicketRow.less'

type TicketSummary = Pick<
    Ticket,
    'channel' | 'excerpt' | 'id' | 'is_unread' | 'status' | 'subject'
>

type Props = {
    ticket: TicketSummary
    lastMessageDatetime?: Ticket['last_message_datetime']
    viewId: string
}

export default function TicketRow({
    lastMessageDatetime,
    ticket: {channel, excerpt, id, is_unread, status, subject},
    viewId,
}: Props) {
    return (
        <Link className={css.wrapper} to={`/app/views/${viewId}/${id}`}>
            <TicketIcon
                className={css.icon}
                channel={channel}
                isOpen={status === TicketStatus.Open}
            />
            <div className={css.panel}>
                <div className={css.subjectWrapper}>
                    <div
                        className={classNames(css.subject, {
                            [css.withCounter]: is_unread,
                        })}
                    >
                        {subject}
                    </div>
                    {is_unread && <div className={css.counter} />}
                </div>
                <div className={css.excerptWrapper}>
                    <div className={css.excerpt}>{excerpt}</div>
                    <div className={css.elapsedTime}>
                        {moment(lastMessageDatetime).fromNow()}
                    </div>
                </div>
            </div>
        </Link>
    )
}
