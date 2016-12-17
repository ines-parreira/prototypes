import React, {PropTypes} from 'react'
import ModalNotification from './ModalNotification'
import ReactTransitionGroup from 'react-addons-transition-group'

const ModalNotifications = ({notifications = [], hide}) => (
    <div>
        <ReactTransitionGroup>
            {notifications.map((notification) => (
                <ModalNotification
                    key={notification.uid}
                    hide={hide}
                    {...notification}
                />
            ))}
        </ReactTransitionGroup>
    </div>
)

ModalNotifications.propTypes = {
    notifications: PropTypes.array.isRequired,
    hide: PropTypes.func.isRequired
}

export default ModalNotifications
