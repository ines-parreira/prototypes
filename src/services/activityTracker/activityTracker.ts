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
        partitionkey: `{account_id: ${window.GORGIAS_STATE.currentAccount.id}, user_id: ${window.GORGIAS_STATE.currentUser.id}}`,
        reverseDNSName: 'com.gorgias.helpdesk.ui',
    },
    getApiHeaders: async () => {
        return await appAuthService.getAccessTokenHeaders()
    },
})

activityTrackerInstance.createUserContext({
    accountId: window.GORGIAS_STATE.currentAccount.id,
    userId: window.GORGIAS_STATE.currentUser.id,
    clientId: window.CLIENT_ID,
    path: window.location.pathname,
})

let activityTrackerHealthCheckInterval: number | null = null

export const startActivityHealthCheck = () => {
    if (activityTrackerHealthCheckInterval) return

    activityTrackerHealthCheckInterval = window.setInterval(() => {
        activityTrackerInstance.logEvent(ActivityEvents.UserIsActive)
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

export const registerActivityTrackerHooks = async () => {
    const isActivityTrackerEnabled = await checkIfTrackerIsEnabled()

    if (isActivityTrackerEnabled) {
        activityTrackerInstance.registerBrowserHooks({
            startEvent: ActivityEvents.UserOpenedApp,
            terminationEvent: ActivityEvents.UserClosedApp,
            focusEvent: ActivityEvents.UserOpenedApp,
            blurEvent: ActivityEvents.UserClosedApp,
        })

        startActivityHealthCheck()
    }
}

export const unregisterActivityTrackerHooks = async () => {
    const isActivityTrackerEnabled = await checkIfTrackerIsEnabled()

    if (isActivityTrackerEnabled) {
        activityTrackerInstance.destroyListeners()
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
