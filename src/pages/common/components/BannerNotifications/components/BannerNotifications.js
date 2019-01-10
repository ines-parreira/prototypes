import React from 'react'
import PropTypes from 'prop-types'
import BannerNotification from './BannerNotification'

const BannerNotifications = ({notifications = [], hide}) => (
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

BannerNotifications.propTypes = {
    notifications: PropTypes.array.isRequired,
    hide: PropTypes.func.isRequired
}

export default BannerNotifications
