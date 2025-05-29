import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

export default function useIsCallbackRequestsEnabled() {
    const isVoiceCallbackEnabledMilestone1 = useFlag(
        FeatureFlagKey.VoiceCallbackEnabled1,
    )
    const isVoiceCallbackEnabledMilestone2 = useFlag(
        FeatureFlagKey.VoiceCallbackEnabled2,
    )
    const isVoiceCallbackEnabled =
        isVoiceCallbackEnabledMilestone1 && isVoiceCallbackEnabledMilestone2

    return isVoiceCallbackEnabled
}
