import { Controller, useFormContext } from 'react-hook-form'

import { Box, ToggleField } from '@gorgias/axiom'

export const IncludeImage = () => {
    const { control } = useFormContext()

    return (
        <Box flexDirection="column" gap="xxs">
            <Controller
                name="include_image"
                control={control}
                render={({ field }) => (
                    <ToggleField
                        label="Include image"
                        caption="Add an image of the last purchased product in the first message."
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />
        </Box>
    )
}
