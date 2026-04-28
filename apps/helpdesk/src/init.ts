import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js'
import moment from 'moment-timezone'

import './polyfills'

import { initializeNewReleaseHandler } from '@repo/api-resources'
import { initFeatureFlagsClient } from '@repo/feature-flags'
import {
    initDatadogLogger,
    initDatadogRum,
    initErrorReporter,
    logEvent,
} from '@repo/logging'
import type { SegmentEvent } from '@repo/logging'
import {
    envVars,
    getEnvironment,
    identifyUser as identifyHotjarUser,
    isProduction,
    isStaging,
} from '@repo/utils'

import { store } from 'common/store'
import type { EditableUserProfile } from 'config/types/user'
import GreyArea from 'domains/reporting/pages/common/components/charts/ChartPluginGreyArea'
import { initClarity } from 'main/init/initClarity'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { notify } from 'state/notifications/actions'
import type { RootState } from 'state/types'
import { transformSystemMessagesToNotifications } from 'utils'
import { initSDKs } from 'utils/sdk'

const initMoment = (currentUser: EditableUserProfile) => {
    // set default timezone
    if (currentUser.timezone) {
        moment.tz.setDefault(currentUser.timezone)
    }
}

export function initApp() {
    const environment = getEnvironment()
    const { WEB_APP_RELEASE } = envVars

    // Supply an initial state to redux for faster page loads. See #752
    const state = store.getState() as RootState
    const hasBillingInitialized = !state.billing.isEmpty()

    if (WEB_APP_RELEASE) {
        const { currentUser, currentAccount } = window.GORGIAS_STATE
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
            automatePlan: hasBillingInitialized
                ? getCurrentAutomatePlan(state)
                : undefined,
        })
    }

    initSDKs()

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

    initializeNewReleaseHandler()

    // Dispatch system messages as notifications
    transformSystemMessagesToNotifications(
        window.SYSTEM_MESSAGES || [],
    ).forEach((notification) => {
        store.dispatch(notify(notification) as any)
    })
    const currentHelpdeskPlan = hasBillingInitialized
        ? getCurrentHelpdeskPlan(state)
        : undefined
    const currentAutomatePlan = hasBillingInitialized
        ? getCurrentAutomatePlan(state)
        : undefined

    initFeatureFlagsClient(
        state.currentUser.toJS(),
        state.currentAccount.toJS(),
        currentHelpdeskPlan?.plan_id,
        currentAutomatePlan?.plan_id,
    )

    void initClarity()

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
        ArcElement,
    )

    return store
}

initApp()
