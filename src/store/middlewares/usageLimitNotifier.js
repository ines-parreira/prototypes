import {fromJS} from 'immutable'
import {browserHistory} from 'react-router'
import {removeNotification as hide} from 'reapop'

import {notify} from '../../state/notifications/actions'
import * as currentAccountTypes from '../../state/currentAccount/constants'
import * as ticketTypes from '../../state/ticket/constants'
import * as newMessageTypes from '../../state/newMessage/constants'
import * as currentAccountSelectors from '../../state/currentAccount/selectors'

const TRACKED_ACTIONS = [
    currentAccountTypes.UPDATE_ACCOUNT_SUCCESS,
    newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
    ticketTypes.FETCH_TICKET_START,
]

export const USAGE_NOTIFICATION_BANNER = 99
export const PAYMENT_MODAL = 100

const _showPaymentModal = (store, notification) => {
    store.dispatch(hide(PAYMENT_MODAL))
    store.dispatch(
        notify({
            id: PAYMENT_MODAL,
            style: 'modal',
            status: notification.get('type'),
            dismissible: true,
            title: 'Trial limits reached',
            message: notification.get('message'),
            buttons: [
                {
                    name: 'Update payment method',
                    color: 'primary',
                    onClick: () => {
                        browserHistory.push('/app/settings/billing')
                    },
                },
            ],
        })
    )
}

// Middleware used to notify user about free limit usage
const usageLimitNotifier = (store) => (next) => (action) => {
    if (!TRACKED_ACTIONS.includes(action.type)) {
        return next(action)
    }

    const _action = fromJS(action)
    const state = store.getState()
    const accountStatus = currentAccountSelectors.getAccountStatus(state)

    if (accountStatus.isEmpty()) {
        return next(action)
    }

    const notification = accountStatus.get('notification') || fromJS({})
    const status = accountStatus.get('status') || 'active'

    switch (action.type) {
        // agent tries to send a message
        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START: {
            if (status === 'deactivated' && notification) {
                _showPaymentModal(store, notification)
                return
            }
            break
        }

        // user opens a ticket
        case ticketTypes.FETCH_TICKET_START: {
            if (!_action.get('displayLoading', false)) {
                break
            }
            if (status === 'deactivated' && notification) {
                _showPaymentModal(store, notification)
            }
            break
        }

        // receive current account data update
        case currentAccountTypes.UPDATE_ACCOUNT_SUCCESS: {
            const nextAccountStatus = _action.getIn(['resp', 'status'])
            const nextStatus = nextAccountStatus.get('status') || 'active'
            const nextNotification =
                nextAccountStatus.get('notification') || fromJS({})

            // Hide the notification if the status was changed
            if (!accountStatus.equals(nextAccountStatus)) {
                store.dispatch(hide(USAGE_NOTIFICATION_BANNER))
            }

            if (nextStatus !== 'active' || !nextNotification.isEmpty()) {
                store.dispatch(
                    notify({
                        id: USAGE_NOTIFICATION_BANNER,
                        style: 'banner',
                        status: nextNotification.get('type'),
                        dismissible: false,
                        message: nextNotification.get('message'),
                        onClick: () => {
                            browserHistory.push('/app/settings/billing')
                        },
                    })
                )
            }
            break
        }
        default:
            break
    }
    return next(action)
}

export default usageLimitNotifier
