import { Box } from '@gorgias/axiom'

import { FrequencyCapsCard } from 'AIJourney/components/FrequencyCapsCard/FrequencyCapsCard'
import { QuietHoursCard } from 'AIJourney/components/QuietHoursCard/QuietHoursCard'

export const ComplianceTab = ({ isFormReady }: { isFormReady: boolean }) => (
    <Box flexDirection="column" gap="md">
        <FrequencyCapsCard isFormReady={isFormReady} />
        <QuietHoursCard isFormReady={isFormReady} />
    </Box>
)
