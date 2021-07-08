import _words from 'lodash/words'
import _max from 'lodash/max'
import _isEqual from 'lodash/isEqual'
import _omit from 'lodash/omit'
import _functions from 'lodash/functions'

import {
    addNotification,
    removeNotification,
    removeNotification as hide,
} from 'reapop'

import history from '../../pages/history'
import {StoreDispatch, RootState} from '../types'

import {Notification, HandleUsageBanner, NotificationStatus} from './types'

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
const cleanNotification = (n: Notification) =>
    _omit(n, _functions(n).concat(['id']))

// detect duplicate notifications
const isDuplicate = (
    notification: Notification,
    oldNotification: Notification
): boolean => {
    if (
        !!notification.isTicketMessageFailedEvent &&
        !!oldNotification.isTicketMessageFailedEvent &&
        notification.message === oldNotification.message
    ) {
        return true
    }

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
 */
export const notify = (message: Notification) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    // don't add empty notifications
    if (!message) {
        return Promise.resolve()
    }

    const status =
        message.status && AUTHORIZED_NOTIFICATION_TYPES.includes(message.status)
            ? message.status
            : NotificationStatus.Info

    const finalMessage: Notification = {
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

    if (!!finalMessage.noAutoDismiss) {
        finalMessage.dismissAfter = 0
    } else if (finalMessage.dismissible && finalMessage.dismissAfter === 0) {
        // calculate auto dismiss time if dismissAfter is not set

        const wordsPerMinute = 230
        const readText = `${finalMessage.title || ''} ${
            finalMessage.message || ''
        }`
        let readingTime = (_words(readText).length * 60) / wordsPerMinute
        readingTime = _max([3, Math.ceil(readingTime)]) as number
        finalMessage.dismissAfter = readingTime * 1000
    }

    const notificationsState = (getState() || {}).notifications || []
    let duplicate = false

    notificationsState.forEach((notification: Notification) => {
        // close previous notifications that were closeOnNext = true
        if (notification.closeOnNext) {
            //eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return dispatch(addNotification(finalMessage)) as Promise<
        ReturnType<StoreDispatch>
    >
}

export const handleUsageBanner = ({
    newAccountStatus,
    notification,
    currentAccountStatus,
}: HandleUsageBanner) => (dispatch: StoreDispatch) => {
    const USAGE_NOTIFICATION_BANNER = 99

    if (currentAccountStatus !== newAccountStatus) {
        //eslint-disable-next-line @typescript-eslint/no-unsafe-call
        dispatch(hide(USAGE_NOTIFICATION_BANNER))
    }

    if (notification) {
        void dispatch(
            notify({
                id: USAGE_NOTIFICATION_BANNER.toString(),
                style: 'banner',
                status: notification.type || NotificationStatus.Warning,
                dismissible: false,
                message: notification.message,
                onClick: () => {
                    history.push('/app/settings/billing')
                },
            })
        )
    }
}
