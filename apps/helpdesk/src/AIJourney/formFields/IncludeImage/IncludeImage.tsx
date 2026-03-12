import { Controller, useFormContext } from 'react-hook-form'

import { Box, ToggleField } from '@gorgias/axiom'

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

export const IncludeImage = ({ journeyType }: { journeyType: string }) => {
    const { control } = useFormContext()

    return (
        <Box flexDirection="column" gap="xxs">
            <Controller
                name="include_image"
                control={control}
                render={({ field }) => (
                    <ToggleField
                        label="Include image"
                        caption={captions[journeyType]}
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />
        </Box>
    )
}
