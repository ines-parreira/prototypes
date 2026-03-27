import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'

export const checkIfAiAgentOnboardingNotificationIsEnabled = async () => {
    const { flag: isAiAgentOnboardingNotificationEnabled } = await fetchFlag(
        FeatureFlagKey.AiAgentOnboardingNotification,
        false,
    )

    return !!isAiAgentOnboardingNotificationEnabled
}
