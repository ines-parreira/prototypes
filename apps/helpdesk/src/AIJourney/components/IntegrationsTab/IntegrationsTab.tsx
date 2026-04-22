import { Box } from '@gorgias/axiom'

import { KlaviyoCard } from 'AIJourney/components/KlaviyoCard/KlaviyoCard'

export const IntegrationsTab = ({ isFormReady }: { isFormReady: boolean }) => (
    <Box flexDirection="column" gap="md">
        <KlaviyoCard isFormReady={isFormReady} />
    </Box>
)
