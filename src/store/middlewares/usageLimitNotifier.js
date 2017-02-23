import {fromJS} from 'immutable'
import {browserHistory} from 'react-router'
import {hide} from 'react-notification-system-redux'
import {NOTIFICATION_UIDS as UIDS} from '../../config'
import {hasReachedLimit} from '../../utils'
import {notify} from '../../state/notifications/actions'
import * as currentAccountTypes from '../../state/currentAccount/constants'
import * as billingTypes from '../../state/billing/constants'
import * as ticketTypes from '../../state/ticket/constants'
import moment from 'moment'
import _some from 'lodash/some'

const TRACKED_ACTIONS = [
    currentAccountTypes.UPDATE_ACCOUNT_SUCCESS,
    billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
    ticketTypes.SUBMIT_TICKET_MESSAGE_SUCCESS,
    ticketTypes.SUBMIT_TICKET_SUCCESS,
    ticketTypes.FETCH_TICKET_START,
    billingTypes.UPDATE_CREDIT_CARD_SUCCESS
]

const usageMaxLimitReachedModalNotif = (freeTickets) => ({
    style: 'modal',
    dismissible: true,
    title: 'Free limit reached',
    message: `You've used your ${freeTickets} free tickets this month. To keep responding to customers,
                    you need to add a payment method.`,
    buttons: [{
        name: 'ADD PAYMENT METHOD',
        color: 'green',
        onClick: () => {
            browserHistory.push('/app/settings/billing')
        }
    }]
})

const accountDeactivatedModalNotif = {
    style: 'modal',
    title: 'Account deactivated',
    message: `Your account has been deactivated due to multiple payment failures. 
                    To re-activate your account, please update your payment method.`,
    buttons: [{
        name: 'UPDATE PAYMENT METHOD',
        color: 'green',
        onClick: () => {
            browserHistory.push('/app/settings/billing')
        }
    }]
}

// Middleware used to notify user about free limit usage
const usageLimitNotifier = store => next => action => {
    const {currentAccount, billing, notifications} = store.getState()

    if (!TRACKED_ACTIONS.includes(action.type)) {
        return next(action)
    }

    const _action = fromJS(action)
    const plan = billing.get('plan')
    const freeTickets = plan.get('free_tickets')
    const tickets = billing.getIn(['currentUsage', 'data', 'tickets'])
    // TODO: remove all code related to effective date of plan
    // when all accounts before `effective_date` have a credit card
    const signupDate = moment(currentAccount.get('created_datetime', moment()))
    const isAboveMinLimit = hasReachedLimit('min', tickets, plan, signupDate)
    const isAboveDefaultLimit = hasReachedLimit('default', tickets, plan, signupDate)
    const isAboveMaxLimit = hasReachedLimit('max', tickets, plan, signupDate)
    const isAccountActive = currentAccount.get('deactivated_datetime', null) === null
    const hasCreditCard = currentAccount.getIn(['meta', 'hasCreditCard'], false)
    const hasShopifyBillingActive = currentAccount.getIn(['meta', 'shopify_billing', 'active'], false)
    const isPaying = hasCreditCard || hasShopifyBillingActive

    switch (action.type) {
        // user send a message
        case ticketTypes.SUBMIT_TICKET_SUCCESS:
        case ticketTypes.SUBMIT_TICKET_MESSAGE_SUCCESS: {
            setTimeout(() => {
                if (!isAccountActive) {
                    store.dispatch(notify(accountDeactivatedModalNotif))
                } else if (!isPaying && isAboveDefaultLimit) {
                    store.dispatch(notify(usageMaxLimitReachedModalNotif(freeTickets)))
                }
            }, 800)
            break
        }

        // user open a ticket
        case ticketTypes.FETCH_TICKET_START: {
            if (!_action.get('displayLoading', false)) {
                break
            }

            if (!isAccountActive) {
                store.dispatch(notify(accountDeactivatedModalNotif))
            } else if (!isPaying && isAboveMaxLimit) {
                store.dispatch(notify(usageMaxLimitReachedModalNotif(freeTickets)))
            }
            break
        }

        // receive current account data up-to-date
        case currentAccountTypes.UPDATE_ACCOUNT_SUCCESS: {
            const nextIsAccountActive = _action.getIn(['resp',
                    'deactivated_datetime'], null) === null

            const nextHasCreditCard = _action.getIn(['resp', 'meta', 'hasCreditCard'])
            const nextHasShopifyBillingActive = _action.getIn(['resp', 'meta', 'shopify_billing', 'active'])
            const nextIsPaying = nextHasCreditCard || nextHasShopifyBillingActive

            const isAlreadyNotified = _some(notifications, {uid: UIDS.accountDeactivated}) ||
                    _some(notifications, {uid: UIDS.accountDeactivatedCardUpdated})

            // user has registered a credit card
            if (!isPaying && nextIsPaying) {
                store.dispatch(hide(UIDS.freeMinLimitReached))
                store.dispatch(hide(UIDS.freeDefaultLimitReached))
            }

            // account is deactivated and not notified or has been deactivated
            if (((!isAccountActive && !isAlreadyNotified) || (isAccountActive)) && !nextIsAccountActive) {
                store.dispatch(notify({
                    uid: UIDS.accountDeactivated,
                    style: 'banner',
                    type: 'error',
                    dismissible: false,
                    onClick: () => {
                        browserHistory.push('/app/settings/billing')
                    },
                    allowHtml: true,
                    message: `Your account has been deactivated due to multiple payment failures. 
                    To re-activate your account, please update your payment method <a>here</a>.`
                }))
            } else if (!isAccountActive && nextIsAccountActive) {
                store.dispatch(hide(UIDS.accountDeactivated))
                store.dispatch(hide(UIDS.accountDeactivatedCardUpdated))
            }
            break
        }

        // receive current usage up-to-date
        case billingTypes.FETCH_CURRENT_USAGE_SUCCESS: {
            // account is unlimited
            if (isPaying) {
                break
            }

            const nextTickets = _action.getIn(['resp', 'data', 'tickets'])
            const nextIsAboveMinLimit = hasReachedLimit('min', nextTickets, plan, signupDate)
            const nextIsAboveDefaultLimit = hasReachedLimit('default', nextTickets, plan, signupDate)

            if ((!isAboveMinLimit && nextIsAboveMinLimit) ||
                (!isAboveDefaultLimit && nextIsAboveDefaultLimit)) {
                let uid = UIDS.freeMinLimitReached
                let level = 'warning'
                let message = `You're getting close to the ${freeTickets} free tickets limit.`

                if (nextIsAboveDefaultLimit) {
                    // user has reach default limit, so we remove previous notification
                    store.dispatch(hide(UIDS.freeMinLimitReached))

                    uid = UIDS.freeDefaultLimitReached
                    level = 'error'
                    message = `You've reached the ${freeTickets} free tickets limit.`
                }

                store.dispatch(notify({
                    uid,
                    style: 'banner',
                    type: level,
                    dismissible: false,
                    onClick: () => {
                        browserHistory.push('/app/settings/billing')
                    },
                    allowHtml: true,
                    message: `${message} Add a payment method <a>here</a> to keep responding to customers.`
                }))
            }
            break
        }
        case billingTypes.UPDATE_CREDIT_CARD_SUCCESS: {
            if (isAccountActive) {
                store.dispatch(notify({
                    type: 'success',
                    message: 'Credit card has been successfully updated.'
                }))
            } else {
                store.dispatch(hide(UIDS.accountDeactivated))
                store.dispatch(notify({
                    uid: UIDS.accountDeactivatedCardUpdated,
                    style: 'banner',
                    type: 'info',
                    dismissible: true,
                    autoDismiss: 0,
                    message: 'We are attempting to pay invoices with your new card. Your account is now active.'
                }))
            }
            break
        }
        default:
            break
    }

    return next(action)
}

export default usageLimitNotifier
