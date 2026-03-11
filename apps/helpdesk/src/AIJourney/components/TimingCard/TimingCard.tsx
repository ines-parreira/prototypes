import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import { MinutesDelay, TargetOrderStatus } from 'AIJourney/formFields'
import { WaitingDays } from 'AIJourney/formFields/WaitingDays/WaitingDays'

export const TimingCard = ({
    journeyType,
    isFormReady,
}: {
    isFormReady: boolean
    journeyType?: JOURNEY_TYPES
}) => {
    const isPostPurchase = journeyType === JOURNEY_TYPES.POST_PURCHASE
    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME
    const isWinBack = journeyType === JOURNEY_TYPES.WIN_BACK

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
                <CardHeader title="Timing" />
                {isPostPurchase && (
                    <>
                        <TargetOrderStatus />
                        <MinutesDelay journeyType={journeyType} />
                    </>
                )}
                {isWelcome && <MinutesDelay journeyType={journeyType} />}
                {isWinBack && (
                    <>
                        <WaitingDays type="cooldown" />
                        <WaitingDays type="inactive-days" />
                    </>
                )}
            </Box>
        </Card>
    )
}
