import { Controller, useFormContext } from 'react-hook-form'

import { TextField } from '@gorgias/axiom'

export const FlowName = () => {
    const { control } = useFormContext()

    return (
        <Controller
            name="flowName"
            control={control}
            rules={{
                required: 'Flow name is required',
                validate: (value) =>
                    value?.trim() ? true : 'Flow name is required',
            }}
            render={({ field, fieldState }) => (
                <TextField
                    label="Flow name"
                    isRequired
                    value={field.value ?? undefined}
                    onChange={(value: string) => field.onChange(value ?? '')}
                    error={fieldState.error?.message}
                    isInvalid={!!fieldState.error}
                />
            )}
        />
    )
}
