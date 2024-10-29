import cn from 'classnames'
import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'

import {TicketMessageSourceType} from 'business/types/ticket'
import SourceIcon from 'pages/common/components/SourceIcon'
import TicketIcon from 'pages/common/components/TicketIcon'

import {Notification, NotificationType} from '../types'

import css from './NotificationContent.less'
import Subtitle from './Subtitle'

type Props = {
    headerExtra?: ReactNode
    notification: Notification
    onClick?: () => void
}

const notificationTypeMap: Record<
    NotificationType,
    {
        title: string
        icon?: {name: string; family?: 'fill' | 'outlined'}
        url?: string
    }
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
    'email-domain.verified': {
        title: 'Domain verification complete',
        icon: {name: 'settings'},
        url: 'app/settings/channels/email',
    },
}

export default function NotificationContent({
    headerExtra,
    notification,
    onClick,
}: Props) {
    const iconConfig = notificationTypeMap[notification.type]?.icon
    const notificationBody: {
        url: string
        title: string
        excerpt?: string
        icon?: ReactNode
    } = {
        url: notificationTypeMap[notification.type]?.url || '#',
        title:
            notificationTypeMap[notification.type]?.title || notification.type,
    }
    if (notification.type === 'email-domain.verified') {
        const {domain} = notification.payload || {}
        if (!domain) return null
        notificationBody.excerpt = `Your domain has been verified! You can now send emails with Gorgias using addresses ending in @${domain}.`
        notificationBody.icon = (
            <div className={css.systemIconWrapper}>
                <SourceIcon
                    type={TicketMessageSourceType.SystemMessage}
                    className={css.systemIcon}
                />
            </div>
        )
    } else {
        const {ticket} = notification.payload || {}
        if (!ticket) return null
        notificationBody.url = `/app/ticket/${ticket.id}`
        notificationBody.excerpt = ticket.excerpt
        notificationBody.icon = (
            <>
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
            </>
        )
    }

    return (
        <Link
            to={notificationBody.url}
            className={css.container}
            onClick={onClick}
        >
            <div className={css.icon}>{notificationBody.icon}</div>
            <div className={css.content}>
                <header className={css.header}>
                    <h4 className={css.type}>
                        {notificationTypeMap[notification.type]?.title ||
                            notification.type}
                    </h4>
                    {headerExtra}
                </header>
                <Subtitle notification={notification} />
                {!!notificationBody.excerpt && (
                    <div className={css.excerpt}>
                        {notificationBody.excerpt}
                    </div>
                )}
            </div>
        </Link>
    )
}
