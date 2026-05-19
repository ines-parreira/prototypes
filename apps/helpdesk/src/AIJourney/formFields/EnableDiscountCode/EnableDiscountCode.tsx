import { Controller, useFormContext } from 'react-hook-form'

import { Box, ToggleField } from '@gorgias/axiom'

export const EnableDiscountCode = ({ label }: { label?: string } = {}) => {
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
                        label={label}
                        aria-label={label ?? 'Enable discount code'}
                    />
                )}
            />
        </Box>
    )
}
