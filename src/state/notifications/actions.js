import _words from 'lodash/words'
import _max from 'lodash/max'
import _isEqual from 'lodash/isEqual'
import _omit from 'lodash/omit'
import _functions from 'lodash/functions'
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
    dismissible: true,
    // styles available: alert, banner, modal
    style: 'alert'
}

// clean-up notification for comparison
const cleanNotification = (n) => _omit(n, _functions(n).concat([
    'uid',
    'level'
]))

// detect duplicate notifications
const isDuplicate = (notification, oldNotification) => {
    return _isEqual(
        cleanNotification(notification),
        cleanNotification(oldNotification)
    )
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
        if (finalMessage.children) {
            finalMessage.autoDismiss = 20
        } else {
            const wordsPerMinute = 230
            const readText = `${finalMessage.title} ${finalMessage.message}`
            let readingTime = _words(readText).length * 60 / wordsPerMinute
            readingTime = _max([3, Math.ceil(readingTime)])
            finalMessage.autoDismiss = readingTime
        }
    }

    const notificationsState = ((getState() || {}).notifications || [])
    let duplicate = false

    notificationsState.forEach((notification) => {
        // close previous notifications that were closeOnNext = true
        if (notification.closeOnNext) {
            dispatch(Notifications.hide(notification.uid))
        }

        // detect duplicate notification
        if (!duplicate) {
            duplicate = isDuplicate(finalMessage, notification)
        }
    })

    // don't add duplicate notifications
    if (duplicate) {
        return Promise.resolve()
    }

    return dispatch(Notifications[type](finalMessage))
}
