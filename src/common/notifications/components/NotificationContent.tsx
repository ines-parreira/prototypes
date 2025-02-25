import React from 'react'
import type { ReactNode } from 'react'

import { Link } from 'react-router-dom'

import { TicketStatus } from 'business/types/ticket'
import type { ChannelLike } from 'models/channel/types'
import TicketIcon from 'pages/common/components/TicketIcon'

import css from './NotificationContent.less'

type NotificationContentProps = {
    children: ReactNode
    headerExtra?: ReactNode
    icon: {
        type: ChannelLike
        status?: TicketStatus
    }
    subIcon?: {
        color?: string
        family?: 'fill' | 'outlined'
        name: string
    }
    title: string
    url: string
    onClick?: () => void
}

export type ParentProps = Omit<
    NotificationContentProps,
    'children' | 'icon' | 'title' | 'url'
>

export default function NotificationContent({
    children,
    headerExtra,
    icon,
    subIcon,
    title,
    url,
    onClick,
}: NotificationContentProps) {
    return (
        <Link className={css.container} to={url} onClick={onClick}>
            <div className={css.icon}>
                <TicketIcon
                    channel={icon.type}
                    status={icon.status || TicketStatus.Open}
                />
                {!!subIcon && (
                    <div
                        className={css.subIcon}
                        style={
                            subIcon.color
                                ? { backgroundColor: `var(${subIcon.color})` }
                                : undefined
                        }
                    >
                        <i
                            className={
                                subIcon.family === 'fill'
                                    ? 'material-icons'
                                    : 'material-icons-outlined'
                            }
                        >
                            {subIcon.name}
                        </i>
                    </div>
                )}
            </div>
            <div className={css.content}>
                <header className={css.header}>
                    <h4 className={css.type}>{title}</h4>
                    {headerExtra}
                </header>
                {children}
            </div>
        </Link>
    )
}
