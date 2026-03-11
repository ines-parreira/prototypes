import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { NumberField } from '@gorgias/axiom'

export const MaxDiscountCode = () => {
    const {
        control,
        formState: { errors },
    } = useFormContext()

    const isDiscountEnabled = useWatch({ control, name: 'offer_discount' })

    return (
        <Controller
            name="max_discount_percent"
            control={control}
            rules={{
                validate: (value) => {
                    if (!isDiscountEnabled) return true
                    const numValue = Number(value)
                    if (!value || numValue === 0) {
                        return 'Field is required'
                    }
                    if (numValue < 1) {
                        return 'Minimum value is 1%'
                    }
                    if (numValue > 100) {
                        return 'Maximum value is 100%'
                    }
                    return true
                },
            }}
            render={({ field }) => (
                <NumberField
                    label="Discount code value"
                    value={field.value ?? undefined}
                    onChange={(value) => field.onChange(value ?? undefined)}
                    error={errors.max_discount_percent?.message as string}
                    trailingSlot={'percent'}
                    style={{ width: '150px' }}
                    formatOptions={{ style: 'decimal', useGrouping: false }}
                    isInvalid={!!errors.max_discount_percent}
                    isRequired
                />
            )}
        />
    )
}
