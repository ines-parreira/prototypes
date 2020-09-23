import {fromJS} from 'immutable'
import moment from 'moment-timezone'

import './polyfills'
import {resendVerificationEmail} from './state/currentAccount/actions.ts'
import {getBaseEmailIntegration} from './state/integrations/selectors.ts'
import {recentViewsStorage} from './state/views/utils.ts'
import {notify} from './state/notifications/actions.ts'
import configureStore from './store/configureStore'
import * as segmentTracker from './store/middlewares/segmentTracker'
import {transformSystemMessagesToNotifications} from './utils'

const initMoment = (currentUser) => {
    // set default locale and timezone
    if (currentUser.language) {
        moment.locale(currentUser.language)
    }

    if (currentUser.timezone) {
        moment.tz.setDefault(currentUser.timezone)
    }
}

// `configureStore` below needs an object as the parameter so here we're making an
// object with immutable object props from a plain JS object.
const toImmutableProps = (plainObject) => {
    const immutableState = {}
    Object.keys(plainObject).forEach((key) => {
        immutableState[key] = fromJS(plainObject[key])
    })

    return immutableState
}

// Supply an initial state to redux for faster page loads. See #752
const initialState = window.GORGIAS_STATE || {}

if (initialState.currentUser) {
    initMoment(initialState.currentUser)
}

const recentViews = recentViewsStorage.get()

if (recentViews) {
    initialState.views.recent = recentViews
}

const eventsToTrack = window.SEGMENT_EVENTS_TO_TRACK
if (eventsToTrack) {
    eventsToTrack.forEach((event) => {
        segmentTracker.logEvent(event.type, event.data)
    })
    delete window.SEGMENT_EVENTS_TO_TRACK
}

export const store = configureStore(toImmutableProps(initialState))

// todo(@martin): delete this in 2021 if we redirect to .com automatically
export const notifyDeprecatedTld = (url, reduxStore) => {
    const urlObject = new URL(url)

    if (urlObject.hostname.match(/.io$/)) {
        const updatedUrl = `https://${urlObject.hostname.replace(
            /.io$/,
            '.com'
        )}/`
        reduxStore.dispatch(
            notify({
                id: 'deprecated-tld-notification',
                style: 'banner',
                status: 'warning',
                dismissible: false,
                message:
                    `We\'re now a dot-com 🎉 please update your helpdesk links and bookmarks to ${updatedUrl}. ` +
                    'This message will be hidden after you login there.',
                onClick: () => {
                    window.location.href = updatedUrl
                },
            })
        )
    }
}

notifyDeprecatedTld(window.location.href, store)

export const notifyAccountNotVerified = (reduxStore) => {
    const baseEmailIntegration = getBaseEmailIntegration(reduxStore.getState())

    if (!baseEmailIntegration.getIn(['meta', 'verified'], true)) {
        reduxStore.dispatch(
            notify({
                allowHTML: true,
                id: 'account-not-verified-notification',
                style: 'banner',
                status: 'warning',
                dismissible: false,
                message:
                    'Your email address is not verified. <u>Click here to resend the verification email</u>',
                onClick: () => resendVerificationEmail()(reduxStore.dispatch),
            })
        )
    }
}

notifyAccountNotVerified(store)

// Dispatch system messages as notifications
transformSystemMessagesToNotifications(window.SYSTEM_MESSAGES || []).forEach(
    (notification) => {
        store.dispatch(notify(notification))
    }
)
