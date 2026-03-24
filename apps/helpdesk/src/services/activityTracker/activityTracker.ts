import { reportError } from '@repo/logging'
import { isDevelopment } from '@repo/utils'
import type { AxiosError } from 'axios'

import BrowserEventTracker from '@gorgias/event-tracker-browser'

import { GorgiasAppAuthService } from 'utils/gorgiasAppsAuth'

import {
    ActivityEvents,
    AGENT_ACTIVITY_HEALTHCHECK_INTERVAL,
} from './constants'
import { checkIfTrackerIsEnabled } from './utils'

export const ingestionEndpoint = isDevelopment()
    ? 'http://localhost:8076/private/track'
    : `https://${
          window.GORGIAS_CLUSTER
      }.events-ingestion-helpdesk.services.gorgias.${location.hostname
          .split('.')
          .pop()!}/private/track`

export const reportSentryError = (error: unknown, event: unknown) => {
    // remove cast when types are corrected in the library
    const axiosError = error as AxiosError<{ message: string; code: number }>
    const sentryError = axiosError.response?.data?.message
        ? new Error(
              `Event ingestion error: ${axiosError.response.data.message}`,
          )
        : (error as Error)
    reportError(sentryError, {
        extra: { event: event as Record<string, unknown> },
    })
}

const appAuthService = new GorgiasAppAuthService()
const activityTrackerInstance = BrowserEventTracker.initialize({
    endpoint: ingestionEndpoint,
    cloudEventsConfig: {
        source: `gorgias/helpdesk/web`,
        dataschemaGroupId: 'helpdesk.ui',
        // optional chaining fixes a Storybook issue with the TicketNavbar component
        partitionkey: `{"account_id": ${window.GORGIAS_STATE?.currentAccount?.id}, "user_id": ${window.GORGIAS_STATE?.currentUser?.id}}`,
        reverseDNSName: 'com.gorgias.helpdesk.ui',
    },
    enableSessionParams: true,
    getApiHeaders: async () => {
        return await appAuthService.getAccessTokenHeaders()
    },
    reportError: reportSentryError,
})

activityTrackerInstance.createUserContext({
    accountId: window.GORGIAS_STATE?.currentAccount?.id,
    userId: window.GORGIAS_STATE?.currentUser?.id,
    clientId: window.CLIENT_ID,
    path: window.location.pathname,
})

let activityTrackerHealthCheckInterval: number | null = null
let unregisterBrowserHooks: (() => void) | null = null

const startActivityHealthCheck = () => {
    if (activityTrackerHealthCheckInterval) return

    activityTrackerHealthCheckInterval = window.setInterval(() => {
        const isFocused = document.hasFocus()
        const isVisible = document.visibilityState === 'visible'

        if (isFocused && isVisible) {
            activityTrackerInstance.logEvent(ActivityEvents.UserIsActive)
        }
    }, AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)
}

const stopActivityHealthCheck = () => {
    if (!activityTrackerHealthCheckInterval) return

    window.clearInterval(activityTrackerHealthCheckInterval)
}

// after feature flags are removed, these helper functions can be removed
// as the check will be redundant
const logActivityEventWithLD = async (
    ...args: Parameters<typeof activityTrackerInstance.logEvent>
) => {
    const isActivityTrackerEnabled = await checkIfTrackerIsEnabled()
    if (isActivityTrackerEnabled) {
        activityTrackerInstance.logEvent(...args)
    } else {
        return
    }
}

export const logActivityEvent = (
    ...args: Parameters<typeof activityTrackerInstance.logEvent>
) => {
    void logActivityEventWithLD(...args)
}

/**
 * This method can be reused to add browser lifecycle hooks
 * for different parts of the app.
 */
export const registerActivityTrackerHooks = async (
    ...args: Parameters<typeof activityTrackerInstance.registerBrowserHooks>
) => {
    const isActivityTrackerEnabled = await checkIfTrackerIsEnabled()
    if (isActivityTrackerEnabled) {
        const unregisterBrowserHooks =
            activityTrackerInstance.registerBrowserHooks(...args)
        return unregisterBrowserHooks
    }
    return
}

/**
 * This method is meant to be used only once,
 * to track generic app lifecycle events.
 */
export const registerAppActivityTrackerHooks = async () => {
    const isActivityTrackerEnabled = await checkIfTrackerIsEnabled()

    if (isActivityTrackerEnabled) {
        unregisterBrowserHooks = activityTrackerInstance.registerBrowserHooks({
            startEvent: { eventTrigger: ActivityEvents.UserOpenedApp },
            terminationEvent: { eventTrigger: ActivityEvents.UserClosedApp },
            focusEvent: { eventTrigger: ActivityEvents.UserOpenedApp },
            blurEvent: { eventTrigger: ActivityEvents.UserClosedApp },
        })

        startActivityHealthCheck()
    }
}

export const unregisterAppActivityTrackerHooks = async () => {
    const isActivityTrackerEnabled = await checkIfTrackerIsEnabled()

    if (isActivityTrackerEnabled) {
        unregisterBrowserHooks?.()
        stopActivityHealthCheck()
    }
}

export const clearActivityTrackerSession = async () => {
    const isActivityTrackerEnabled = await checkIfTrackerIsEnabled()

    if (isActivityTrackerEnabled) {
        activityTrackerInstance.clearSession()
    }
}

export default activityTrackerInstance
