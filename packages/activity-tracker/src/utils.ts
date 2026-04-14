import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'

export const isSessionImpersonated = () => {
    return !!window.USER_IMPERSONATED
}

export const checkIfTrackerIsEnabled = async () => {
    try {
        const { flag: isActivityTrackerEnabled } = await fetchFlag(
            FeatureFlagKey.AgentActivityTracking,
            false,
        )

        return isActivityTrackerEnabled && !isSessionImpersonated()
    } catch {
        return false
    }
}
