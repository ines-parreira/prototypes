// @flow
import React from 'react'
import {connect} from 'react-redux'
import {removeNotification as hide} from 'reapop'

import BannerNotification from './BannerNotification'

type Props = {
    notifications: Array<*>,
    hide: (number | string) => void
}

const BannerNotifications = ({notifications = [], hide}: Props) => (
    <div>
        {notifications.map((notification) => (
            <BannerNotification
                key={notification.id}
                hide={hide}
                {...notification}
            />
        ))}
    </div>
)

export default connect(null, {hide})(BannerNotifications)
