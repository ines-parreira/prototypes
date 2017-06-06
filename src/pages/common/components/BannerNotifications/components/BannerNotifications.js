import React, {PropTypes} from 'react'
import BannerNotification from './BannerNotification'

const BannerNotifications = ({notifications = [], hide}) => (
    <div>
        {notifications.map((notification) => (
            <BannerNotification
                key={notification.uid}
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
