import React, {ComponentProps} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {removeNotification as hide} from 'reapop'

import {Notification} from '../../../../state/notifications/types'

import BannerNotification from './BannerNotification'

type OwnProps = {
    notifications: Array<Notification>
}

const BannerNotifications = ({
    notifications = [],
    hide,
}: OwnProps & ConnectedProps<typeof connector>) => (
    <div>
        {notifications.map((notification) => (
            <BannerNotification
                key={notification.id as string}
                //@ts-ignore ts-2783
                hide={hide}
                {...(notification as ComponentProps<typeof BannerNotification>)}
            />
        ))}
    </div>
)

const connector = connect(null, {hide})

export default connector(BannerNotifications)
