import { Box } from '@gorgias/axiom'

import { IdentitySettingsCard } from 'AIJourney/components/IdentitySettingsCard/IdentitySettingsCard'

export const SenderIdentityTab = ({
    isFormReady,
}: {
    isFormReady: boolean
}) => (
    <Box flexDirection="column" gap="md">
        <IdentitySettingsCard isFormReady={isFormReady} />
    </Box>
)
