import _ from 'lodash'
import Notifications from 'react-notification-system-redux'

const AUTHORIZED_NOTIFICATION_TYPES = [
    'success',
    'error',
    'warning',
    'info'
]

const INITIAL_MESSAGE = {
    position: 'tc',
    autoDismiss: 0,
    dismissible: true
}

/**
 * Notification system based on :
 * - https://github.com/igorprado/react-notification-system
 * - https://github.com/gor181/react-notification-system-redux
 *
 * set autoDismiss = false to make the notification not leave until the user clicks on it
 * set closeOnNext = true to make the notification close on next notification addition
 * @param message
 */
export const notify = (message) => (dispatch, getState) => {
    const type = AUTHORIZED_NOTIFICATION_TYPES.includes(message.type)
        ? message.type
        : 'info'

    const finalMessage = {
        ...INITIAL_MESSAGE,
        ...message
    }

    // delete type otherwise it is interpreted as an action type by Redux
    delete finalMessage.type

    // if no content, set title as the content
    if (finalMessage.title && !finalMessage.message && !finalMessage.children) {
        finalMessage.message = finalMessage.title
        delete finalMessage.title
    }

    // calculate auto dismiss time if autoDismiss is not set
    if (finalMessage.dismissible && finalMessage.autoDismiss === 0) {
        const wordsPerMinute = 250
        let readingTime = _.words(finalMessage.message).length * 60 / wordsPerMinute
        readingTime = _.max([3, readingTime])
        finalMessage.autoDismiss = Math.round(readingTime)
    }

    const notificationsState = ((getState() || {}).notifications || [])

    // close previous notifications that were closeOnNext = true
    notificationsState.forEach((notification) => {
        if (notification.closeOnNext) {
            dispatch(Notifications.hide(notification.uid))
        }
    })

    return dispatch(Notifications[type](finalMessage))
}
