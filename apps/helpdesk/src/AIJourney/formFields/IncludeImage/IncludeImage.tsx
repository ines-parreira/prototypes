import { Controller, useFormContext } from 'react-hook-form'

import { Box, Icon, ToggleField, Tooltip, TooltipContent } from '@gorgias/axiom'

import { JOURNEY_TYPES } from 'AIJourney/constants'

const captions = {
    [JOURNEY_TYPES.CART_ABANDONMENT]:
        'Add an image of the items left in their cart in the first message.',
    [JOURNEY_TYPES.SESSION_ABANDONMENT]:
        'Add an image of the product from their last visited page in the first message.',
    [JOURNEY_TYPES.WIN_BACK]:
        'Add an image of the featured product in the first message.',
    [JOURNEY_TYPES.POST_PURCHASE]:
        'Add an image of the last purchased product in the first message.',
}

export const IncludeImage = ({
    journeyType,
    isV3Architecture,
}: {
    journeyType: string
    isV3Architecture?: boolean
}) => {
    const { control } = useFormContext()

    return (
        <Box flexDirection="column" gap="xxs">
            <Controller
                name="include_image"
                control={control}
                render={({ field }) => {
                    const toggle = (
                        <ToggleField
                            label="Include product image"
                            caption={
                                isV3Architecture
                                    ? undefined
                                    : captions[journeyType]
                            }
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )

                    if (!isV3Architecture) {
                        return toggle
                    }

                    return (
                        <Box flexDirection="row" alignItems="center" gap="xxs">
                            {toggle}
                            <span>
                                <Tooltip
                                    delay={0}
                                    trigger={<Icon name="info" />}
                                >
                                    <TooltipContent title="Shows the relevant product from the shopper's session, pulled from Shopify" />
                                </Tooltip>
                            </span>
                        </Box>
                    )
                }}
            />
        </Box>
    )
}
