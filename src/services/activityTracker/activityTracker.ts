import BrowserEventTracker from '@gorgias/event-tracker-browser'

import {GorgiasAppAuthService} from 'utils/gorgiasAppsAuth'
import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'
import {isDevelopment} from 'utils/environment'

import {ActivityEvents, AGENT_ACTIVITY_HEALTHCHECK_INTERVAL} from './constants'

const ingestionEndpoint = isDevelopment()
    ? 'http://localhost:8076/private/track'
    : `https://${
          window.GORGIAS_CLUSTER
      }.events-ingestion.services.gorgias.${location.hostname
          .split('.')
          .pop()!}/private/track`

const appAuthService = new GorgiasAppAuthService()
const activityTrackerInstance = BrowserEventTracker.initialize({
    endpoint: ingestionEndpoint,
    cloudEventsConfig: {
        source: `gorgias/helpdesk/web`,
        dataschemaGroupId: 'helpdesk.ui',
        // optional chaining fixes a Storybook issue with the TicketNavbar component
        partitionkey: `{account_id: ${window.GORGIAS_STATE?.currentAccount?.id}, user_id: ${window.GORGIAS_STATE?.currentUser?.id}}`,
        reverseDNSName: 'com.gorgias.helpdesk.ui',
    },
    getApiHeaders: async () => {
        return await appAuthService.getAccessTokenHeaders()
    },
})

activityTrackerInstance.createUserContext({
    accountId: window.GORGIAS_STATE?.currentAccount?.id,
    userId: window.GORGIAS_STATE?.currentUser?.id,
    clientId: window.CLIENT_ID,
    path: window.location.pathname,
})

let activityTrackerHealthCheckInterval: number | null = null
let unregisterBrowserHooks: (() => void) | null = null

export const startActivityHealthCheck = () => {
    if (activityTrackerHealthCheckInterval) return

    activityTrackerHealthCheckInterval = window.setInterval(() => {
        const isFocused = document.hasFocus()
        const isVisible = document.visibilityState === 'visible'

        if (isFocused && isVisible) {
            activityTrackerInstance.logEvent(ActivityEvents.UserIsActive)
        }
    }, AGENT_ACTIVITY_HEALTHCHECK_INTERVAL)
}

export const stopActivityHealthCheck = () => {
    if (!activityTrackerHealthCheckInterval) return

    window.clearInterval(activityTrackerHealthCheckInterval)
}

const checkIfTrackerIsEnabled = async () => {
    const launchDarklyClient = getLDClient()
    await launchDarklyClient.waitForInitialization()
    const isActivityTrackerEnabled = !!launchDarklyClient.variation(
        FeatureFlagKey.AgentActivityTracking
    )
    return isActivityTrackerEnabled
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
            startEvent: {eventTrigger: ActivityEvents.UserOpenedApp},
            terminationEvent: {eventTrigger: ActivityEvents.UserClosedApp},
            focusEvent: {eventTrigger: ActivityEvents.UserOpenedApp},
            blurEvent: {eventTrigger: ActivityEvents.UserClosedApp},
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
