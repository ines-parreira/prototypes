import { memo } from 'react'

import cn from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'
import RelativeTime from 'pages/common/components/RelativeTime'

import type { Notification } from '../types'
import getNotificationConfig from '../utils/getNotificationConfig'

import css from './FeedItem.less'

export type Props = {
    notification: Notification
    onClick?: () => void
    onToggleRead?: () => void
}

export default memo(function FeedItem({
    notification,
    onClick,
    onToggleRead,
}: Props) {
    const config = getNotificationConfig(notification)
    if (!config) return null

    const Component = config.component

    const isRead = !!notification.read_datetime
    return (
        <div className={css.container}>
            <Component
                headerExtra={
                    <div className={css.headerExtra}>
                        {!isRead && <div className={css.unread} />}
                        <span className={css.time}>
                            <RelativeTime
                                datetime={notification.inserted_datetime}
                            />
                        </span>
                    </div>
                }
                notification={notification}
                onClick={onClick}
            />
            <IconButton
                intent="secondary"
                size="small"
                className={cn(css.toggleButton, {
                    [css.markUnreadButton]: isRead,
                })}
                iconClassName={
                    isRead
                        ? css.markUnreadIcon
                        : cn('material-icons-outlined', css.icon)
                }
                onClick={onToggleRead}
            >
                {isRead ? undefined : 'check_box'}
            </IconButton>
        </div>
    )
})
