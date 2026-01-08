import _functions from 'lodash/functions'
import _isEqual from 'lodash/isEqual'
import _max from 'lodash/max'
import _omit from 'lodash/omit'
import _words from 'lodash/words'
import type { Notification as ReapopNotification } from 'reapop'
import {
    notify as addNotification,
    dismissNotification,
    POSITIONS,
} from 'reapop'

import { AlertBannerTypes } from 'AlertBanners/types'

import type { RootState, StoreDispatch } from '../types'
import type { HandleUsageBanner, Notification } from './types'
import {
    isAlertNotification,
    isBannerNotification,
    NotificationStatus,
    NotificationStyle,
} from './types'

export const INITIAL_MESSAGE = {
    position: POSITIONS.topCenter,
    dismissible: true,
    buttons: [],
    allowHTML: false,
    showDismissButton: false,
}

// clean-up notification for comparison
const cleanNotification = (n: Notification) =>
    _omit(n, _functions(n).concat(['id']))

// detect duplicate notifications
const isDuplicate = (
    notification: Notification,
    oldNotification: Notification,
): boolean => {
    if (
        isAlertNotification(notification) &&
        isAlertNotification(oldNotification) &&
        !!notification.isTicketMessageFailedEvent &&
        !!oldNotification.isTicketMessageFailedEvent &&
        notification.message === oldNotification.message
    ) {
        return true
    }

    return _isEqual(
        cleanNotification(notification),
        cleanNotification(oldNotification),
    )
}

/**
 * Notification system using:
 * - https://github.com/LouisBarranqueiro/reapop
 *
 * set dismissAfter = 0 to make the notification not leave until the user clicks on it
 * set closeOnNext = true to make the notification close on next notification addition
 */
export const notify =
    (message?: Notification) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        // don't add empty notifications
        if (!message) {
            return Promise.resolve()
        }

        let finalMessage: Notification = {}

        if (isAlertNotification(message)) {
            const status = Object.values(NotificationStatus).includes(
                message.status as NotificationStatus,
            )
                ? message.status
                : NotificationStatus.Info

            let dismissAfter: number = message.dismissAfter || 0
            if (!!message.noAutoDismiss) {
                dismissAfter = 0
            } else if (
                // calculate auto dismiss time if dismissAfter is not set
                // and dismissible is true or undefined
                !(message.dismissible === false) &&
                !message.dismissAfter
            ) {
                const wordsPerMinute = 230
                const readText = `${message.title || ''} ${
                    message.message || ''
                }`
                let readingTime =
                    (_words(readText).length * 60) / wordsPerMinute
                readingTime = _max([3, Math.ceil(readingTime)]) as number
                dismissAfter = readingTime * 1000
            }

            finalMessage = {
                ...INITIAL_MESSAGE,
                ...message,
                status,
                dismissAfter,
            }

            // if no content, set title as the content
            if (finalMessage.title && !finalMessage.message) {
                finalMessage.message = finalMessage.title
                finalMessage.title = undefined
            }
        } else if (isBannerNotification(message)) {
            const type = Object.values(AlertBannerTypes).includes(
                message.type as AlertBannerTypes,
            )
                ? message.type
                : AlertBannerTypes.Info

            finalMessage = {
                ...message,
                type,
            }
        }

        const notificationsState = (getState() || {}).notifications || []
        let duplicate = false

        notificationsState.forEach((notification: Notification) => {
            // close previous notifications that were closeOnNext = true
            if (isAlertNotification(notification) && notification.closeOnNext) {
                dispatch(dismissNotification(notification.id!))
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

        return dispatch(
            addNotification(finalMessage as ReapopNotification),
        ) as unknown as Promise<ReturnType<StoreDispatch>>
    }

export const handleUsageBanner =
    ({
        newAccountStatus,
        currentAccountStatus,
        notification,
    }: HandleUsageBanner) =>
    (dispatch: StoreDispatch) => {
        const USAGE_NOTIFICATION_BANNER = '99'

        if (currentAccountStatus !== newAccountStatus) {
            dispatch(dismissNotification(USAGE_NOTIFICATION_BANNER))
        }

        if (notification) {
            const defaultCTA = {
                type: 'internal' as const,
                text: 'Go to billing page',
                to: '/app/settings/billing',
            }

            void dispatch(
                notify({
                    id: USAGE_NOTIFICATION_BANNER,
                    style: NotificationStyle.Banner,
                    type:
                        // until we update backend types in `g/models/account.py`
                        notification.type === ('error' as AlertBannerTypes)
                            ? AlertBannerTypes.Critical
                            : AlertBannerTypes.Warning,
                    message: notification.message,
                    CTA: notification.CTA ? notification.CTA : defaultCTA,
                }),
            )
        }
    }
