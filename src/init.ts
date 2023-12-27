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
    ArcElement,
} from 'chart.js'
import {SankeyController, Flow} from 'chartjs-chart-sankey'

import './polyfills'

import {logEvent, SegmentEvent} from 'common/segment'
import {store} from 'common/store'
import {EditableUserProfile} from 'config/types/user'
import {resendVerificationEmail} from 'state/currentAccount/actions'
import {getBaseEmailIntegration} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {transformSystemMessagesToNotifications} from 'utils'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {getCurrentUser} from 'state/currentUser/selectors'
import {initDatadogLogger, initDatadogRum} from 'utils/datadog'
import {initializeNewReleaseHandler} from 'models/api/resources'
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
    // set default timezone
    if (currentUser.timezone) {
        moment.tz.setDefault(currentUser.timezone)
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

export function initApp() {
    const environment = getEnvironment()

    if (isStaging() || isProduction()) {
        initDatadogLogger({
            account: window.GORGIAS_STATE.currentAccount,
            user: window.GORGIAS_STATE.currentUser,
            version: window.GORGIAS_RELEASE,
            environment,
        })
        initDatadogRum({
            account: window.GORGIAS_STATE.currentAccount,
            user: window.GORGIAS_STATE.currentUser,
            version: window.GORGIAS_RELEASE,
            environment,
        })
    }

    if (window.SENTRY_DSN) {
        initErrorReporter({
            dsn: window.SENTRY_DSN,
            release: window.GORGIAS_RELEASE,
            environment,
            currentUser: window.GORGIAS_STATE.currentUser,
            currentAccount: window.GORGIAS_STATE.currentAccount,
        })
    }

    // Supply an initial state to redux for faster page loads. See #752
    const state = store.getState() as RootState

    if (state.currentUser) {
        initMoment(state.currentUser.toJS())
    }

    const eventsToTrack = window.SEGMENT_EVENTS_TO_TRACK
    if (eventsToTrack) {
        eventsToTrack.forEach((event) => {
            logEvent(event.type as SegmentEvent, event.data)
        })
        delete window.SEGMENT_EVENTS_TO_TRACK
    }

    initializeNewReleaseHandler(store)

    notifyAccountNotVerified(store)
    notifyUserImpersonated(store)

    // Dispatch system messages as notifications
    transformSystemMessagesToNotifications(
        window.SYSTEM_MESSAGES || []
    ).forEach((notification) => {
        store.dispatch(notify(notification) as any)
    })
    const hasBillingInitialized = !state.billing.isEmpty()
    const currentHelpdeskProduct = hasBillingInitialized
        ? getCurrentHelpdeskProduct(state)
        : undefined
    const currentAutomationProduct = hasBillingInitialized
        ? getCurrentAutomationProduct(state)
        : undefined

    initLaunchDarkly(
        state.currentUser.toJS(),
        state.currentAccount.toJS(),
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
        GreyArea,
        ArcElement
    )

    return store
}

initApp()
