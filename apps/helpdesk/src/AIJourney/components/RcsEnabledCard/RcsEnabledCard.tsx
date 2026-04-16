import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import { EnableRcs } from 'AIJourney/formFields'

export const RcsEnabledCard = ({ isFormReady }: { isFormReady: boolean }) => {
    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={680} height={200} />
            </Box>
        )
    }

    return (
        <Card width={680}>
            <Box
                width="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                <CardHeader title="RCS enabled" />
                <EnableRcs />
            </Box>
        </Card>
    )
}
