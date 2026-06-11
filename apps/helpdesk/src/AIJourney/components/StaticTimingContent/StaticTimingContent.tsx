import {
    Box,
    Icon,
    ListItem,
    SelectField,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { JOURNEY_TYPES } from 'AIJourney/constants'

const STATIC_CONTENT = {
    [JOURNEY_TYPES.CART_ABANDONMENT]: 'Cart abandoned',
    [JOURNEY_TYPES.SESSION_ABANDONMENT]: 'Browse abandoned',
    [JOURNEY_TYPES.WELCOME]: 'Subscribed to SMS',
    [JOURNEY_TYPES.WIN_BACK]: 'Shopper inactive',
}

const DELAY_TOOLTIP: Partial<Record<JOURNEY_TYPES, string>> = {
    [JOURNEY_TYPES.CART_ABANDONMENT]:
        'Minutes to wait after the order event before messaging.',
    [JOURNEY_TYPES.SESSION_ABANDONMENT]:
        'Minutes to wait after the last page visited event before messaging.',
}

export const StaticTimingContent = ({
    journeyType = JOURNEY_TYPES.CART_ABANDONMENT,
    isV3Architecture,
}: {
    journeyType?:
        | typeof JOURNEY_TYPES.CART_ABANDONMENT
        | typeof JOURNEY_TYPES.SESSION_ABANDONMENT
        | typeof JOURNEY_TYPES.WELCOME
        | typeof JOURNEY_TYPES.WIN_BACK
    isV3Architecture?: boolean
}) => {
    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME
    const isWinBack = journeyType === JOURNEY_TYPES.WIN_BACK
    const staticValue = { id: 'static', label: STATIC_CONTENT[journeyType] }

    if (isV3Architecture) {
        const delayValue = { id: 'delay', label: '30 min' }

        return (
            <Box flexDirection="column" gap="md">
                <SelectField
                    label="Start when"
                    items={[staticValue]}
                    value={staticValue}
                    onChange={() => {}}
                    isDisabled
                >
                    {(option) => <ListItem label={option.label} />}
                </SelectField>
                {!isWelcome && !isWinBack && (
                    <SelectField
                        label="Send delay"
                        items={[delayValue]}
                        value={delayValue}
                        onChange={() => {}}
                        isDisabled
                    >
                        {(option) => <ListItem label={option.label} />}
                    </SelectField>
                )}
            </Box>
        )
    }

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
                                <TooltipContent
                                    title={
                                        DELAY_TOOLTIP[journeyType] ??
                                        'Minutes to wait after the order event before messaging.'
                                    }
                                />
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
