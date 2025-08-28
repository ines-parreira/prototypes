import { FeatureFlagKey } from '@repo/feature-flags'

import { getLDClient } from 'utils/launchDarkly'

export const checkIfAiAgentOnboardingNotificationIsEnabled = async () => {
    const launchDarklyClient = getLDClient()
    await launchDarklyClient.waitForInitialization()
    const isAiAgentOnboardingNotificationEnabled =
        !!launchDarklyClient.variation(
            FeatureFlagKey.AiAgentOnboardingNotification,
        )

    return isAiAgentOnboardingNotificationEnabled
}
