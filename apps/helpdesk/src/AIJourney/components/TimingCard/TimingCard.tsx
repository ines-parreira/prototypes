import {
    Box,
    Card,
    CardHeader,
    Icon,
    Skeleton,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { StaticTimingContent } from 'AIJourney/components/StaticTimingContent/StaticTimingContent'
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
    const isCartAbandonment = journeyType === JOURNEY_TYPES.CART_ABANDONMENT
    const isSessionAbandonment =
        journeyType === JOURNEY_TYPES.SESSION_ABANDONMENT

    const shouldRenderStaticContent =
        isCartAbandonment || isSessionAbandonment || isWelcome
    const shouldRenderTooltip = isCartAbandonment || isSessionAbandonment

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={680} height={200} />
            </Box>
        )
    }

    return (
        <Card width={680} gap="lg">
            <Box alignItems="center" gap="xxs">
                <CardHeader title="Timing" />
                {shouldRenderTooltip && (
                    <span>
                        <Tooltip delay={0} trigger={<Icon name="info" />}>
                            <TooltipContent title="These settings are managed by Gorgias and cannot be edited for this flow type." />
                        </Tooltip>
                    </span>
                )}
            </Box>
            <Box flexDirection="column" gap="md">
                {shouldRenderStaticContent && (
                    <StaticTimingContent journeyType={journeyType} />
                )}
                {isPostPurchase && (
                    <>
                        <TargetOrderStatus />
                        <MinutesDelay journeyType={journeyType} />
                    </>
                )}
                {isWelcome && <MinutesDelay journeyType={journeyType} />}
                {isWinBack && (
                    <>
                        <WaitingDays type="inactive-days" />
                        <WaitingDays type="cooldown" />
                    </>
                )}
            </Box>
        </Card>
    )
}
