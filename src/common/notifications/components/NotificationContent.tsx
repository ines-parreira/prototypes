import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import cn from 'classnames'

import TicketIcon from 'pages/common/components/TicketIcon'

import {Notification, NotificationType} from '../types'

import Subtitle from './Subtitle'
import css from './NotificationContent.less'

type Props = {
    headerExtra?: ReactNode
    notification: Notification
    onClick?: () => void
}

const notificationTypeMap: Record<NotificationType, string> = {
    'ticket.snooze-expired': 'Snooze expired',
    'ticket-message.created': 'New message',
    'user.mentioned': 'New mention',
}

export default function NotificationContent({
    headerExtra,
    notification,
    onClick,
}: Props) {
    const {ticket} = notification.payload || {}
    if (!ticket) return null

    const hasTypeIcon =
        notification.type === 'ticket.snooze-expired' ||
        notification.type === 'user.mentioned'

    return (
        <Link
            to={`/app/ticket/${ticket.id}`}
            className={css.container}
            onClick={onClick}
        >
            <div className={css.icon}>
                <TicketIcon channel={ticket.channel} status={ticket.status} />
                {hasTypeIcon && (
                    <div
                        className={cn(css.typeIcon, {
                            [css.snooze]:
                                notification.type === 'ticket.snooze-expired',
                            [css.mention]:
                                notification.type === 'user.mentioned',
                        })}
                    >
                        <i className="material-icons-outlined">
                            {notification.type === 'ticket.snooze-expired' &&
                                'snooze'}
                            {notification.type === 'user.mentioned' &&
                                'alternate_email'}
                        </i>
                    </div>
                )}
            </div>
            <div className={css.content}>
                <header className={css.header}>
                    <h4 className={css.type}>
                        {notificationTypeMap[notification.type] ||
                            notification.type}
                    </h4>
                    {headerExtra}
                </header>
                <Subtitle notification={notification} />
                {!!ticket.excerpt && (
                    <div className={css.excerpt}>{ticket.excerpt}</div>
                )}
            </div>
        </Link>
    )
}
