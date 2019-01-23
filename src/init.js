import {fromJS} from 'immutable'
import moment from 'moment-timezone'
import numbro from 'numbro'
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

const initNumbro = (currentUser) => {
    // set default locale and timezone
    if (currentUser.language) {
        numbro.setLanguage(currentUser.language)
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
    initNumbro(initialState.currentUser)
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

// Dispatch system messages as notifications
transformSystemMessagesToNotifications(window.SYSTEM_MESSAGES || [])
    .forEach((notification) => {store.dispatch(notify(notification))})
