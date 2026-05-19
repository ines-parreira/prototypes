import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import { KlaviyoPermissionBanner } from 'AIJourney/components/KlaviyoPermissionBanner/KlaviyoPermissionBanner'
import { AudienceSelect } from 'AIJourney/formFields'
import { useJourneyContext } from 'AIJourney/providers'

type Props = {
    isFormReady: boolean
    isV3Architecture?: boolean
}

export const AudienceCard = ({
    isFormReady,
    isV3Architecture = false,
}: Props) => {
    const { currentIntegration, shopName } = useJourneyContext()

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton
                    width={isV3Architecture ? undefined : 680}
                    height={200}
                />
            </Box>
        )
    }

    if (isV3Architecture) {
        return (
            <Box flexDirection="column" gap="xs" width="100%">
                <KlaviyoPermissionBanner
                    integrationId={currentIntegration?.id}
                    settingsUrl={`/app/ai-journey/${shopName}/settings/integrations`}
                />
                <AudienceSelect type="include" />
                <AudienceSelect type="exclude" />
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
