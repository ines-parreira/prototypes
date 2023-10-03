import React from 'react'
import classNames from 'classnames'
import moment from 'moment'

import {TicketStatus} from 'business/types/ticket'
import {Ticket} from 'models/ticket/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import TicketIcon from 'pages/common/components/TicketIcon'

import css from './TicketRow.less'

type TicketSummary = Pick<Ticket, 'channel' | 'excerpt' | 'status' | 'subject'>

type Props = {
    ticket: TicketSummary
    lastMessageDatetime?: Ticket['last_message_datetime']
    messagesCount?: Ticket['messages_count']
}

export default function TicketRow({
    lastMessageDatetime,
    messagesCount,
    ticket: {channel, excerpt, status, subject},
}: Props) {
    return (
        <div className={css.wrapper}>
            <TicketIcon
                className={css.icon}
                channel={channel}
                isOpen={status === TicketStatus.Open}
            />
            <div className={css.panel}>
                <div className={css.subjectWrapper}>
                    <div
                        className={classNames(css.subject, {
                            [css.withCounter]: messagesCount !== undefined,
                        })}
                    >
                        {subject}
                    </div>
                    {messagesCount !== undefined && (
                        <Badge className={css.counter} type={ColorType.Error}>
                            {messagesCount}
                        </Badge>
                    )}
                </div>
                <div className={css.excerptWrapper}>
                    <div className={css.excerpt}>{excerpt}</div>
                    <div className={css.elapsedTime}>
                        {moment(lastMessageDatetime).fromNow()}
                    </div>
                </div>
            </div>
        </div>
    )
}
