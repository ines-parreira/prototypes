import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import { KlaviyoPermissionBanner } from 'AIJourney/components/KlaviyoPermissionBanner/KlaviyoPermissionBanner'
import { AudienceSelect } from 'AIJourney/formFields'
import { useJourneyContext } from 'AIJourney/providers'

export const AudienceCard = ({ isFormReady }: { isFormReady: boolean }) => {
    const { currentIntegration, shopName } = useJourneyContext()

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={680} height={200} />
            </Box>
        )
    }

    return (
        <Card width={680}>
            <Box flexDirection="column" gap="md">
                <CardHeader title="Audience" />
                <KlaviyoPermissionBanner
                    integrationId={currentIntegration?.id}
                    settingsUrl={`/app/ai-journey/${shopName}/settings/integrations`}
                />
                <AudienceSelect type="include" />
                <AudienceSelect type="exclude" />
            </Box>
        </Card>
    )
}
