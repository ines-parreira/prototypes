import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import { EnableRcs } from 'AIJourney/formFields'

type Props = {
    isFormReady: boolean
    isV3Architecture?: boolean
}

export const RcsEnabledCard = ({
    isFormReady,
    isV3Architecture = false,
}: Props) => {
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
        return <EnableRcs label="RCS enabled" />
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
