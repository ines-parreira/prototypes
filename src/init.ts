import {setDefaultConfig} from '@gorgias/api-queries'
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
import moment from 'moment-timezone'
import {Store} from 'redux'

import './polyfills'

import {logEvent, SegmentEvent} from 'common/segment'
import {store} from 'common/store'
import {EditableUserProfile} from 'config/types/user'
import {initializeNewReleaseHandler} from 'models/api/resources'
import GreyArea from 'pages/stats/ChartPluginGreyArea'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import {resendVerificationEmail} from 'state/currentAccount/actions'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getBaseEmailIntegration} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {RootState} from 'state/types'
import {transformSystemMessagesToNotifications} from 'utils'
import {initDatadogLogger, initDatadogRum} from 'utils/datadog'
import {
    envVars,
    getEnvironment,
    isProduction,
    isStaging,
} from 'utils/environment'
import {initErrorReporter} from 'utils/errors'
import {identifyUser as identifyHotjarUser} from 'utils/hotjar'
import {initLaunchDarkly} from 'utils/launchDarkly'

import {getCurrentAccountState} from './state/currentAccount/selectors'

setDefaultConfig({
    headers: {
        'X-CSRF-Token': window.CSRF_TOKEN,
        'X-Gorgias-User-Client': 'web',
    },
})

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
        const state = reduxStore.getState()
        const currentUser = getCurrentUser(state)
        const currentAccount = getCurrentAccountState(state)

        reduxStore.dispatch(
            notify({
                allowHTML: true,
                id: 'user-impersonated-notification',
                style: NotificationStyle.Banner,
                status: NotificationStatus.Warning,
                dismissible: false,
                message: `Impersonating <b>${
                    currentUser.get('email') as string
                }</b> in <b>${getEnvironment()}</b> environment.
                cluster='${window.GORGIAS_CLUSTER}' and account_id=${
                    currentAccount.get('id') as string
                } and user_id=${currentUser.get('id') as string}`,
            }) as any
        )
    }
}

export function initApp() {
    const environment = getEnvironment()
    const {WEB_APP_RELEASE} = envVars

    if (WEB_APP_RELEASE) {
        const {currentUser, currentAccount} = window.GORGIAS_STATE
        if (isStaging() || isProduction()) {
            initDatadogLogger({
                account: currentAccount,
                user: currentUser,
                serverVersion: window.GORGIAS_RELEASE,
                clientVersion: WEB_APP_RELEASE,
                environment,
            })
            initDatadogRum({
                account: currentAccount,
                user: currentUser,
                serverVersion: window.GORGIAS_RELEASE,
                clientVersion: WEB_APP_RELEASE,
                environment,
            })
        }

        if (window.SENTRY_DSN) {
            initErrorReporter({
                dsn: window.SENTRY_DSN,
                clientVersion: WEB_APP_RELEASE,
                serverVersion: window.GORGIAS_RELEASE,
                environment,
                currentUser,
                currentAccount,
            })
        }

        identifyHotjarUser({
            currentAccount,
            currentUser,
            clientVersion: WEB_APP_RELEASE,
            serverVersion: window.GORGIAS_RELEASE,
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
        ? getCurrentHelpdeskPlan(state)
        : undefined
    const currentAutomationProduct = hasBillingInitialized
        ? getCurrentAutomatePlan(state)
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
        Filler,
        GreyArea,
        ArcElement
    )

    return store
}

initApp()
