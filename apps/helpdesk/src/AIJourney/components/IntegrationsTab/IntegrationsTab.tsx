import { Box } from '@gorgias/axiom'

import { KlaviyoCard } from 'AIJourney/components/KlaviyoCard/KlaviyoCard'
import { ShopifyCard } from 'AIJourney/components/ShopifyCard/ShopifyCard'

export const IntegrationsTab = ({ isFormReady }: { isFormReady: boolean }) => (
    <Box flexDirection="column" gap="md">
        <KlaviyoCard isFormReady={isFormReady} />
        <ShopifyCard />
    </Box>
)
