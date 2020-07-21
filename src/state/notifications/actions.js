// @flow
import _words from 'lodash/words'
import _max from 'lodash/max'
import _isEqual from 'lodash/isEqual'
import _omit from 'lodash/omit'
import _functions from 'lodash/functions'

import {addNotification, removeNotification} from 'reapop'

import type {dispatchType, getStateType} from '../types'

import type {Notification} from './types'

export const AUTHORIZED_NOTIFICATION_TYPES = [
    'success',
    'error',
    'warning',
    'info',
    'loading',
]

export const INITIAL_MESSAGE = {
    position: 'tc',
    dismissAfter: 0,
    dismissible: true,
    buttons: [],
    allowHTML: false,
    closeButton: false,
    // styles available: alert, banner, modal
    style: 'alert',
}

// clean-up notification for comparison
const cleanNotification = (n): {} => _omit(n, _functions(n).concat(['id']))

// detect duplicate notifications
const isDuplicate = (
    notification: Notification,
    oldNotification: Notification
): boolean => {
    return _isEqual(
        cleanNotification(notification),
        cleanNotification(oldNotification)
    )
}

/**
 * Notification system using:
 * - https://github.com/LouisBarranqueiro/reapop
 *
 * set dismissAfter = 0 to make the notification not leave until the user clicks on it
 * set closeOnNext = true to make the notification close on next notification addition
 * @param message
 */
export const notify = (message: Notification) => (
    dispatch: dispatchType,
    getState: getStateType
): Promise<dispatchType> => {
    // don't add empty notifications
    if (!message) {
        return Promise.resolve()
    }

    const status = AUTHORIZED_NOTIFICATION_TYPES.includes(message.status)
        ? message.status
        : 'info'

    const finalMessage = {
        ...INITIAL_MESSAGE,
        ...message,
        ...{status},
    }

    // TODO(@ghinda): use message everywhere, and remove this conditional
    // if no content, set title as the content
    if (finalMessage.title && !finalMessage.message) {
        finalMessage.message = finalMessage.title
        delete finalMessage.title
    }

    // calculate auto dismiss time if dismissAfter is not set
    if (finalMessage.dismissible && finalMessage.dismissAfter === 0) {
        const wordsPerMinute = 230
        const readText = `${finalMessage.title || ''} ${
            finalMessage.message || ''
        }`
        let readingTime = (_words(readText).length * 60) / wordsPerMinute
        readingTime = _max([3, Math.ceil(readingTime)])
        finalMessage.dismissAfter = readingTime * 1000
    }

    const notificationsState = (getState() || {}).notifications || []
    let duplicate = false

    notificationsState.forEach((notification) => {
        // close previous notifications that were closeOnNext = true
        if (notification.closeOnNext) {
            dispatch(removeNotification(notification.id))
        }

        // detect duplicate notification
        if (!duplicate) {
            duplicate = isDuplicate(finalMessage, notification)
        }
    })

    // don't add duplicate notifications
    // FIXME: Return the original notification (to be able to update it for example)
    if (duplicate) {
        return Promise.resolve()
    }

    return dispatch(addNotification(finalMessage))
}
