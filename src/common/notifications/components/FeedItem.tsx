import React from 'react'

import RelativeTime from 'pages/common/components/RelativeTime'

import {Notification} from '../types'

import NotificationContent from './NotificationContent'
import css from './FeedItem.less'

export type Props = {
    notification: Notification
}

export default React.memo(function FeedItem({notification}: Props) {
    return (
        <div className={css.container}>
            <NotificationContent
                headerExtra={
                    <div className={css.headerExtra}>
                        {!notification.read_datetime && (
                            <div className={css.unread} />
                        )}
                        <span className={css.time}>
                            <RelativeTime
                                datetime={notification.inserted_datetime}
                            />
                        </span>
                    </div>
                }
                notification={notification}
            />
        </div>
    )
})
