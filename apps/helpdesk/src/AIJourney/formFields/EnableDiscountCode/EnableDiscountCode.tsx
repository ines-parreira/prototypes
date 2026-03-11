import { Controller, useFormContext } from 'react-hook-form'

import { Box, ToggleField } from '@gorgias/axiom'

export const EnableDiscountCode = () => {
    const { control } = useFormContext()

    return (
        <Box flexDirection="column" gap="xxs">
            <Controller
                name="offer_discount"
                control={control}
                render={({ field }) => (
                    <ToggleField
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />
        </Box>
    )
}
