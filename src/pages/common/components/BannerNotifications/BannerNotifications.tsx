import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {dismissNotification as hide} from 'reapop'

import {BannerNotification as BannerNotificationType} from 'state/notifications/types'

import AlertBanner from './AlertBanner'

type OwnProps = {
    notifications: Array<BannerNotificationType>
}

const BannerNotifications = ({
    notifications = [],
}: OwnProps & ConnectedProps<typeof connector>) => {
    return (
        <div>
            {notifications.map((notification) => (
                <AlertBanner key={notification.id} {...notification} />
            ))}
        </div>
    )
}

const connector = connect(null, {hide})

export default connector(BannerNotifications)
