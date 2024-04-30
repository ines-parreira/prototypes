import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'

import TicketIcon from 'pages/common/components/TicketIcon'

import {Notification, NotificationType} from '../types'

import css from './NotificationContent.less'

type Props = {
    headerExtra?: ReactNode
    notification: Notification
    onClick?: () => void
}

const notificationTypeMap: Record<NotificationType, string> = {
    'message-received': 'New message',
    'snooze-expired': 'Snooze expired',
}

export default function NotificationContent({
    headerExtra,
    notification,
    onClick,
}: Props) {
    const {ticket} = notification.payload || {}
    if (!ticket) return null

    return (
        <Link
            to={`/app/ticket/${ticket.id}`}
            className={css.container}
            onClick={onClick}
        >
            <div className={css.icon}>
                <TicketIcon channel={ticket.channel} status={ticket.status} />
            </div>
            <div className={css.content}>
                <header className={css.header}>
                    <h4 className={css.type}>
                        {notificationTypeMap[notification.type]}
                    </h4>
                    {headerExtra}
                </header>
                <p className={css.subtitle}>
                    <strong>{ticket.subject}</strong> from{' '}
                    <strong>{ticket.sender.name}</strong>
                </p>

                {!!ticket.excerpt && (
                    <div className={css.excerpt}>{ticket.excerpt}</div>
                )}
            </div>
        </Link>
    )
}
