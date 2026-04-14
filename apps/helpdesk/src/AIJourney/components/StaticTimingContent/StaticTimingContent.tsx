import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { JOURNEY_TYPES } from 'AIJourney/constants'

const STATIC_CONTENT = {
    [JOURNEY_TYPES.CART_ABANDONMENT]: 'Cart abandoned',
    [JOURNEY_TYPES.SESSION_ABANDONMENT]: 'Browse abandoned',
    [JOURNEY_TYPES.WELCOME]: 'Subscribed to SMS',
}

export const StaticTimingContent = ({
    journeyType = JOURNEY_TYPES.CART_ABANDONMENT,
}: {
    journeyType?:
        | typeof JOURNEY_TYPES.CART_ABANDONMENT
        | typeof JOURNEY_TYPES.SESSION_ABANDONMENT
        | typeof JOURNEY_TYPES.WELCOME
}) => {
    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME

    return (
        <Box flexDirection="column" gap="md">
            <Box flexDirection="column" gap="xxxs">
                <Box alignItems="center" gap="xxs">
                    <Text as="span" size="md" variant="medium">
                        Start this flow when
                    </Text>
                    {isWelcome && (
                        <span>
                            <Tooltip delay={0} trigger={<Icon name="info" />}>
                                <TooltipContent title="These settings are managed by Gorgias and cannot be edited for this flow type." />
                            </Tooltip>
                        </span>
                    )}
                </Box>
                <Text size="md" variant="regular">
                    {STATIC_CONTENT[journeyType]}
                </Text>
            </Box>
            {!isWelcome && (
                <Box flexDirection="column">
                    <Box alignItems="center" gap="xxs">
                        <Text as="span" size="md" variant="medium">
                            Delay before first message
                        </Text>
                        <span>
                            <Tooltip delay={0} trigger={<Icon name="info" />}>
                                <TooltipContent title="Minutes to wait after the order event before messaging." />
                            </Tooltip>
                        </span>
                    </Box>
                    <Text size="md" variant="regular">
                        30 min
                    </Text>
                </Box>
            )}
        </Box>
    )
}
