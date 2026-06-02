import { Controller, useFormContext } from 'react-hook-form'

import { TextField } from '@gorgias/axiom'

export const JourneyName = () => {
    const { control } = useFormContext()

    return (
        <Controller
            name="journeyName"
            control={control}
            render={({ field }) => (
                <TextField
                    label="Flow name"
                    value={field.value ?? undefined}
                    onChange={(value: string) => field.onChange(value ?? '')}
                />
            )}
        />
    )
}
