import { FormField } from '@repo/forms'

import { ListItem, SelectField } from '@gorgias/axiom'

import { timeUnits } from 'pages/settings/SLAs/config/time'
import type { TimeUnitOption } from 'pages/settings/SLAs/config/time'

type TimeUnitSelectFieldProps = {
    name: string
    isDisabled?: boolean
}

export default function TimeUnitSelectField({
    name,
    isDisabled,
}: TimeUnitSelectFieldProps) {
    return (
        <FormField
            field={SelectField<TimeUnitOption>}
            placeholder="Select time unit"
            name={name}
            items={timeUnits}
            isDisabled={isDisabled}
            inputTransform={(id) => timeUnits.find((unit) => unit.id === id)}
            outputTransform={(value) => value.id}
        >
            {(option: TimeUnitOption) => (
                <ListItem id={option.id} label={option.label} />
            )}
        </FormField>
    )
}
