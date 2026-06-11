import { FormField } from '@repo/forms'

import { ListItem, SelectField } from '@gorgias/axiom'

import { timeUnits } from 'pages/settings/SLAs/config/time'
import type { TimeUnitOption } from 'pages/settings/SLAs/config/time'

type TimeUnitSelectFieldProps = {
    name: string
    isDisabled?: boolean
}

export function TimeUnitSelectField({
    name,
    isDisabled,
}: TimeUnitSelectFieldProps) {
    return (
        <FormField name={name} isDisabled={isDisabled}>
            {(field) => (
                <SelectField<TimeUnitOption>
                    {...field}
                    placeholder="Select time unit"
                    items={timeUnits}
                    value={timeUnits.find((unit) => unit.id === field.value)}
                    onChange={(value) => field.onChange(value?.id)}
                >
                    {(option: TimeUnitOption) => (
                        <ListItem id={option.id} label={option.label} />
                    )}
                </SelectField>
            )}
        </FormField>
    )
}
