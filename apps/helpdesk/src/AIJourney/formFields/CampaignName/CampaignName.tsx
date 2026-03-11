import { Controller, useFormContext } from 'react-hook-form'

import { TextField } from '@gorgias/axiom'

export const CampaignName = () => {
    const { control } = useFormContext()

    return (
        <Controller
            name={'campaignTitle'}
            control={control}
            render={({ field }) => (
                <TextField
                    label="Campaign name"
                    isRequired
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                />
            )}
        />
    )
}
