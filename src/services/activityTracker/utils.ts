import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'

export const isSessionImpersonated = () => {
    return !!window.USER_IMPERSONATED
}

export const checkIfTrackerIsEnabled = async () => {
    try {
        const launchDarklyClient = getLDClient()
        await launchDarklyClient.waitForInitialization(3)
        const isActivityTrackerEnabled = !!launchDarklyClient.variation(
            FeatureFlagKey.AgentActivityTracking
        )

        return isActivityTrackerEnabled && !isSessionImpersonated()
    } catch {
        return false
    }
}
