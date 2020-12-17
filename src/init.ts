import {fromJS} from 'immutable'
import moment from 'moment-timezone'
import {Store} from 'redux'

import './polyfills.js'
import {EditableUserProfile} from './config/types/user'
import {resendVerificationEmail} from './state/currentAccount/actions'
import {getBaseEmailIntegration} from './state/integrations/selectors'
import {recentViewsStorage} from './state/views/utils'
import {notify} from './state/notifications/actions'
import configureStore from './store/configureStore.js'
import * as segmentTracker from './store/middlewares/segmentTracker.js'
import {transformSystemMessagesToNotifications} from './utils'
import {NotificationStatus} from './state/notifications/types'
import {GorgiasInitialState, InitialRootState} from './types'
import {initDatadogLogger} from './utils/datadog'

const initMoment = (currentUser: EditableUserProfile) => {
    // set default locale and timezone
    if (currentUser.language) {
        moment.locale(currentUser.language)
    }

    if (currentUser.timezone) {
        moment.tz.setDefault(currentUser.timezone)
    }
}

export const toInitialStoreState = (initialState: GorgiasInitialState) => {
    const nextState: Record<keyof GorgiasInitialState | string, any> = {
        ...initialState,
    }
    const sections = initialState.viewSections
    delete nextState.viewSections

    const recentViews = recentViewsStorage.get()
    if (recentViews) {
        ;(nextState.views as GorgiasInitialState['views']).recent = recentViews
    }

    ;(Object.keys(nextState) as (keyof GorgiasInitialState)[]).forEach(
        (key) => {
            nextState[key] = fromJS(nextState[key])
        }
    )
    nextState.entities = {sections}

    return nextState as InitialRootState
}

if (window.PRODUCTION) {
    initDatadogLogger(
        window.GORGIAS_STATE.currentAccount,
        window.GORGIAS_STATE.currentUser,
        window.GORGIAS_RELEASE
    )
}

// Supply an initial state to redux for faster page loads. See #752
const initialState = window.GORGIAS_STATE || {}

if (initialState.currentUser) {
    initMoment((initialState.currentUser as unknown) as EditableUserProfile)
}

const eventsToTrack = window.SEGMENT_EVENTS_TO_TRACK
if (eventsToTrack) {
    eventsToTrack.forEach((event) => {
        segmentTracker.logEvent(event.type, event.data)
    })
    delete window.SEGMENT_EVENTS_TO_TRACK
}

//$TsFixMe: remove on configureStore migration
export const store = ((configureStore as unknown) as (
    initialState: Record<string, unknown>
) => Store)(toInitialStoreState(initialState))

// todo(@martin): delete this in 2021 if we redirect to .com automatically
export const notifyDeprecatedTld = (url: string, reduxStore: Store) => {
    const urlObject = new URL(url)

    //eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    if (urlObject.hostname.match(/.io$/)) {
        const updatedUrl = `https://${urlObject.hostname.replace(
            /.io$/,
            '.com'
        )}/`
        reduxStore.dispatch(
            notify({
                id: 'deprecated-tld-notification',
                style: 'banner',
                status: NotificationStatus.Warning,
                dismissible: false,
                message:
                    `We\'re now a dot-com 🎉 please update your helpdesk links and bookmarks to ${updatedUrl}. ` +
                    'This message will be hidden after you login there.',
                onClick: () => {
                    window.location.href = updatedUrl
                },
            }) as any
        )
    }
}

notifyDeprecatedTld(window.location.href, store)

export const notifyAccountNotVerified = (reduxStore: Store) => {
    const baseEmailIntegration = getBaseEmailIntegration(reduxStore.getState())

    if (!baseEmailIntegration.getIn(['meta', 'verified'], true)) {
        reduxStore.dispatch(
            notify({
                allowHTML: true,
                id: 'account-not-verified-notification',
                style: 'banner',
                status: NotificationStatus.Warning,
                dismissible: false,
                message:
                    'Your email address is not verified. <u>Click here to resend the verification email</u>',
                onClick: () => resendVerificationEmail()(reduxStore.dispatch),
            }) as any
        )
    }
}

notifyAccountNotVerified(store)

// Dispatch system messages as notifications
transformSystemMessagesToNotifications(window.SYSTEM_MESSAGES || []).forEach(
    (notification) => {
        store.dispatch(notify(notification) as any)
    }
)
