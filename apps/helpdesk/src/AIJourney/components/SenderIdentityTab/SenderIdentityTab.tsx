import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box } from '@gorgias/axiom'

import { IdentitySettingsCard } from 'AIJourney/components/IdentitySettingsCard/IdentitySettingsCard'
import { ToneOfVoiceCard } from 'AIJourney/components/ToneOfVoiceCard/ToneOfVoiceCard'

export const SenderIdentityTab = ({
    isFormReady,
}: {
    isFormReady: boolean
}) => {
    const { value: isToneOfVoiceEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiJourneyToneOfVoice,
    )

    return (
        <Box flexDirection="column" gap="md">
            <IdentitySettingsCard isFormReady={isFormReady} />
            {isToneOfVoiceEnabled && (
                <ToneOfVoiceCard isFormReady={isFormReady} />
            )}
        </Box>
    )
}
