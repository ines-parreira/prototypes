import { FeatureFlagKey, getLDClient } from '@repo/feature-flags'

export const checkIfAiAgentOnboardingNotificationIsEnabled = async () => {
    const launchDarklyClient = getLDClient()
    await launchDarklyClient.waitForInitialization()
    const isAiAgentOnboardingNotificationEnabled =
        !!launchDarklyClient.variation(
            FeatureFlagKey.AiAgentOnboardingNotification,
        )

    return isAiAgentOnboardingNotificationEnabled
}
