import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

const isSessionImpersonated = () => {
    return !!window.USER_IMPERSONATED
}

export const checkIfTrackerIsEnabled = async () => {
    const launchDarklyClient = getLDClient()
    await launchDarklyClient.waitForInitialization()
    const isActivityTrackerEnabled = !!launchDarklyClient.variation(
        FeatureFlagKey.AgentActivityTracking
    )

    return isActivityTrackerEnabled && !isSessionImpersonated()
}
