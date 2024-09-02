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

const notificationTypeMap: Record<
    NotificationType,
    {title: string; icon?: {name: string; family?: 'fill' | 'outlined'}}
> = {
    'ticket.snooze-expired': {title: 'Snooze expired', icon: {name: 'snooze'}},
    'user.mentioned': {title: 'New mention', icon: {name: 'alternate_email'}},
    'ticket.assigned': {
        title: 'You’ve been assigned to a ticket',
        icon: {name: 'person', family: 'fill'},
    },
    'ticket-message.created': {title: 'New message'},
    'ticket-message.created.email': {title: 'New message'},
    'ticket-message.created.chat': {title: 'New message'},
    'ticket-message.created.phone': {title: 'New message'},
    'ticket-message.created.sms': {title: 'New message'},
    'ticket-message.created.facebook': {title: 'New message'},
    'ticket-message.created.instagram': {title: 'New message'},
    'ticket-message.created.whatsapp': {title: 'New message'},
    'ticket-message.created.yotpo': {title: 'New message'},
    'ticket-message.created.aircall': {title: 'New message'},
}

export default function NotificationContent({
    headerExtra,
    notification,
    onClick,
}: Props) {
    const {ticket} = notification.payload || {}
    if (!ticket) return null

    const iconConfig = notificationTypeMap[notification.type]?.icon

    return (
        <Link
            to={`/app/ticket/${ticket.id}`}
            className={css.container}
            onClick={onClick}
        >
            <div className={css.icon}>
                <TicketIcon channel={ticket.channel} status={ticket.status} />
                {!!iconConfig && (
                    <div
                        className={cn(css.typeIcon, {
                            [css.mention]:
                                notification.type === 'user.mentioned',
                        })}
                    >
                        <i
                            className={
                                iconConfig.family === 'fill'
                                    ? 'material-icons'
                                    : 'material-icons-outlined'
                            }
                        >
                            {iconConfig.name}
                        </i>
                    </div>
                )}
            </div>
            <div className={css.content}>
                <header className={css.header}>
                    <h4 className={css.type}>
                        {notificationTypeMap[notification.type]?.title ||
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
