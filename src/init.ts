import {fromJS} from 'immutable'
import moment from 'moment-timezone'
import {Store} from 'redux'
import {
    Chart,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import {SankeyController, Flow} from 'chartjs-chart-sankey'
import {omit} from 'lodash'

import './polyfills'

import {EditableUserProfile} from 'config/types/user'
import {resendVerificationEmail} from 'state/currentAccount/actions'
import {getBaseEmailIntegration} from 'state/integrations/selectors'
import {recentViewsStorage} from 'state/views/utils'
import {notify} from 'state/notifications/actions'
import configureStore from 'store/configureStore'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {transformSystemMessagesToNotifications} from 'utils'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {getCurrentUser} from 'state/currentUser/selectors'
import {GorgiasInitialState, InitialRootState} from 'types'
import {initDatadogLogger, initDatadogRum} from 'utils/datadog'
import {initializeNewReleaseHandler} from 'models/api/resources'
import {Tag} from 'models/tag/types'
import {View} from 'models/view/types'
import {NewPhoneNumber, OldPhoneNumber} from 'models/phoneNumber/types'
import {initLaunchDarkly} from 'utils/launchDarkly'
import {getEnvironment, isProduction, isStaging} from 'utils/environment'
import {initErrorReporter} from 'utils/errors'
import {
    getCurrentAutomationProduct,
    getCurrentHelpdeskProduct,
} from 'state/billing/selectors'
import {RootState} from 'state/types'
import GreyArea from 'pages/stats/ChartPluginGreyArea'

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

    const tags = initialState.tags?.items.reduce(
        (acc: {[key: string]: Tag}, tag) => {
            acc[tag.id] = tag as Tag
            return acc
        },
        {}
    )

    const views = initialState.views?.items.reduce(
        (acc: {[key: string]: View}, view) => {
            acc[view.id] = view
            return acc
        },
        {}
    )

    const phoneNumbers = initialState.phoneNumbers?.reduce(
        (acc: {[key: number]: OldPhoneNumber}, phoneNumber) => {
            acc[phoneNumber.id] = phoneNumber
            return acc
        },
        {}
    )
    delete nextState.phoneNumbers

    const newPhoneNumbers = initialState.newPhoneNumbers?.reduce(
        (acc: {[key: number]: NewPhoneNumber}, phoneNumber) => {
            acc[phoneNumber.id] = phoneNumber
            return acc
        },
        {}
    )
    delete nextState.newPhoneNumbers

    nextState.entities = {
        sections,
        tags,
        views,
        phoneNumbers,
        newPhoneNumbers,
    }

    return nextState as InitialRootState
}

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
                style: NotificationStyle.Banner,
                status: NotificationStatus.Warning,
                dismissible: false,
                allowHTML: true,
                message:
                    `We\'re now a dot-com 🎉 please update your helpdesk links and bookmarks to <span class="text-primary">${updatedUrl}</span>. ` +
                    'This message will be hidden after you login there.',
                onClick: () => {
                    window.location.href = updatedUrl
                },
            }) as any
        )
    }
}

export const notifyAccountNotVerified = (reduxStore: Store) => {
    const baseEmailIntegration = getBaseEmailIntegration(reduxStore.getState())

    if (!baseEmailIntegration.getIn(['meta', 'verified'], true)) {
        reduxStore.dispatch(
            notify({
                allowHTML: true,
                id: 'account-not-verified-notification',
                style: NotificationStyle.Banner,
                status: NotificationStatus.Warning,
                dismissible: false,
                message:
                    'Your email address is not verified. <span class="text-primary">Click here to resend the verification email.</span>',
                onClick: () => resendVerificationEmail()(reduxStore.dispatch),
            }) as any
        )
    }
}

export const notifyUserImpersonated = (reduxStore: Store) => {
    if (window.USER_IMPERSONATED) {
        const currentUser = getCurrentUser(reduxStore.getState())

        reduxStore.dispatch(
            notify({
                allowHTML: true,
                id: 'user-impersonated-notification',
                style: NotificationStyle.Banner,
                status: NotificationStatus.Warning,
                dismissible: false,
                message: `You are impersonating <b>${
                    currentUser.get('name') as string
                }</b> in <b>${getEnvironment()}</b> environment.`,
            }) as any
        )
    }
}

export type InitAppParams = {
    datadog: boolean
    sentry: boolean
}

export function initApp({datadog, sentry}: InitAppParams) {
    if (datadog && (isStaging() || isProduction())) {
        initDatadogLogger(
            window.GORGIAS_STATE.currentAccount,
            window.GORGIAS_STATE.currentUser,
            window.GORGIAS_RELEASE
        )
        initDatadogRum(
            window.GORGIAS_STATE.currentAccount,
            window.GORGIAS_STATE.currentUser,
            window.GORGIAS_RELEASE
        )
    }

    if (sentry && window.SENTRY_DSN) {
        initErrorReporter({
            dsn: window.SENTRY_DSN,
            release: window.GORGIAS_RELEASE,
            environment: getEnvironment(),
            currentUser: window.GORGIAS_STATE.currentUser,
            currentAccount: window.GORGIAS_STATE.currentAccount,
        })
    }

    // Supply an initial state to redux for faster page loads. See #752
    const initialState = omit(window.GORGIAS_STATE, 'channels') || {}

    if (initialState.currentUser) {
        initMoment(initialState.currentUser as unknown as EditableUserProfile)
    }

    const eventsToTrack = window.SEGMENT_EVENTS_TO_TRACK
    if (eventsToTrack) {
        eventsToTrack.forEach((event) => {
            logEvent(event.type as SegmentEvent, event.data)
        })
        delete window.SEGMENT_EVENTS_TO_TRACK
    }

    const store = configureStore(toInitialStoreState(initialState))

    initializeNewReleaseHandler(store)

    notifyDeprecatedTld(window.location.href, store)
    notifyAccountNotVerified(store)
    notifyUserImpersonated(store)

    // Dispatch system messages as notifications
    transformSystemMessagesToNotifications(
        window.SYSTEM_MESSAGES || []
    ).forEach((notification) => {
        store.dispatch(notify(notification) as any)
    })
    const state = store.getState()
    const hasBillingInitialized = !(state as RootState).billing.isEmpty()
    const currentHelpdeskProduct = hasBillingInitialized
        ? getCurrentHelpdeskProduct(state)
        : undefined
    const currentAutomationProduct = hasBillingInitialized
        ? getCurrentAutomationProduct(state)
        : undefined

    initLaunchDarkly(
        initialState.currentUser,
        initialState.currentAccount,
        currentHelpdeskProduct?.price_id,
        currentAutomationProduct?.price_id
    )

    Chart.register(
        BarController,
        BarElement,
        LineController,
        LineElement,
        PointElement,
        Tooltip,
        Legend,
        LinearScale,
        CategoryScale,
        SankeyController,
        Flow,
        Filler,
        GreyArea
    )

    return store
}

export const store = initApp({
    sentry: true,
    datadog: true,
})
