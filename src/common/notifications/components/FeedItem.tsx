import cn from 'classnames'
import React from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import RelativeTime from 'pages/common/components/RelativeTime'

import {Notification} from '../types'

import css from './FeedItem.less'
import NotificationContent from './NotificationContent'

export type Props = {
    notification: Notification
    onClick?: () => void
    onToggleRead?: () => void
}

export default React.memo(function FeedItem({
    notification,
    onClick,
    onToggleRead,
}: Props) {
    const isRead = !!notification.read_datetime
    return (
        <div className={css.container}>
            <NotificationContent
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
