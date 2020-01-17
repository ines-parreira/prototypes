import {fromJS} from 'immutable'
import moment from 'moment-timezone'
import Promise from 'promise-polyfill'
import includes from 'array-includes'

import configureStore from './store/configureStore'
import {recentViewsStorage} from './state/views/utils'
import {transformSystemMessagesToNotifications} from './utils'
import {notify} from './state/notifications/actions'
import * as segmentTracker from './store/middlewares/segmentTracker'

// Polyfills
Array.prototype.includes = Array.prototype.includes || includes // eslint-disable-line no-extend-native
window.Promise = window.Promise || Promise

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
        const updatedUrl = `https://${urlObject.hostname.replace(/.io$/, '.com')}/`
        reduxStore.dispatch(notify({
            style: 'banner',
            status: 'warning',
            dismissible: false,
            message: `We\'re now a dot-com 🎉 please update your helpdesk links and bookmarks to ${updatedUrl}. `
            + 'This message will be hidden after you login there.',
            onClick: () => {
                window.location.href = updatedUrl
            },
        }))
    }
}

notifyDeprecatedTld(window.location.href, store)

// Dispatch system messages as notifications
transformSystemMessagesToNotifications(window.SYSTEM_MESSAGES || [])
    .forEach((notification) => {store.dispatch(notify(notification))})
