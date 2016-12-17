import React, {PropTypes} from 'react'
import BannerNotification from './BannerNotification'
import ReactTransitionGroup from 'react-addons-transition-group'

const BannerNotifications = ({notifications = [], hide}) => (
    <div>
        <ReactTransitionGroup>
            {notifications.map((notification) => (
                <BannerNotification
                    key={notification.uid}
                    hide={hide}
                    {...notification}
                />
            ))}
        </ReactTransitionGroup>
    </div>
)

BannerNotifications.propTypes = {
    notifications: PropTypes.array.isRequired,
    hide: PropTypes.func.isRequired
}

export default BannerNotifications
