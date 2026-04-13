import { Box } from '@gorgias/axiom'

import { FrequencyCapsCard } from 'AIJourney/components/FrequencyCapsCard/FrequencyCapsCard'

export const ComplianceTab = ({ isFormReady }: { isFormReady: boolean }) => (
    <Box flexDirection="column" gap="md">
        <FrequencyCapsCard isFormReady={isFormReady} />
    </Box>
)
