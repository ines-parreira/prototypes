import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import { AudienceSelect } from 'AIJourney/formFields'

export const AudienceCard = ({ isFormReady }: { isFormReady: boolean }) => {
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
                <AudienceSelect type="include" />
                <AudienceSelect type="exclude" />
            </Box>
        </Card>
    )
}
