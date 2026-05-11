import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import { KlaviyoPermissionBanner } from 'AIJourney/components/KlaviyoPermissionBanner/KlaviyoPermissionBanner'
import { AudienceSelect } from 'AIJourney/formFields'
import { useJourneyContext } from 'AIJourney/providers'

export const AudienceCard = ({ isFormReady }: { isFormReady: boolean }) => {
    const { currentIntegration } = useJourneyContext()

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
                />
                <AudienceSelect type="include" />
                <AudienceSelect type="exclude" />
            </Box>
        </Card>
    )
}
