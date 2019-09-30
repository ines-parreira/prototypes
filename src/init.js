import {fromJS} from 'immutable'
import moment from 'moment-timezone'
import Promise from 'promise-polyfill'
import includes from 'array-includes'

import configureStore from './store/configureStore'
import {recentViewsStorage} from './state/views/utils'
import {transformSystemMessagesToNotifications} from './utils'
import {notify} from './state/notifications/actions'
import * as segmentTracker from './store/middlewares/segmentTracker'
import {makeGetIntegrationsByTypes} from './state/integrations/selectors'
import {AIRCALL_INTEGRATION_TYPE} from './constants/integration'

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

// TODO(@LouisBarranqueiro): remove this case when all Aircall migration will use the new webhook endpoint.
const aircallIntegrations = makeGetIntegrationsByTypes(store.getState())(AIRCALL_INTEGRATION_TYPE)
const hasAircallIntegrationsUsingPreviousEndpoint = aircallIntegrations.filterNot((integration) => {
    return integration.get('deactivated_datetime') ||
        integration.get('deactivated_datetime') ||
        integration.getIn(['meta', 'use_new_webhook_endpoint'])
})
if (hasAircallIntegrationsUsingPreviousEndpoint.size) {
    store.dispatch(notify({
        'status': 'warning',
        'style': 'banner',
        'message': '[ACTION REQUIRED] Breaking changes affecting your Aircall integrations will be released on October 5th, 2019. Please click here to see the migration guide.',
        'onClick': () => {
            window.open('https://gorgias.helpdocs.io/article/inbkefgkib', '_blank')
        }
    }))
}

// Dispatch system messages as notifications
transformSystemMessagesToNotifications(window.SYSTEM_MESSAGES || [])
    .forEach((notification) => {store.dispatch(notify(notification))})
