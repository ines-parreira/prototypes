import { useEffect } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'
import { BusinessHoursTimeframe } from '@gorgias/helpdesk-types'

import { useFieldArray } from 'core/forms'
import { DEFAULT_BUSINESS_HOUR } from 'pages/settings/businessHours/constants'

import TimeScheduleRow from './TimeScheduleRow'

import css from './TimeScheduleField.less'

type Props = {
    name: string
    root?: HTMLElement
    defaultValues?: BusinessHoursTimeframe
}

export default function PrefilledTimeScheduleField({
    name,
    root,
    defaultValues = DEFAULT_BUSINESS_HOUR,
}: Props) {
    const { fields, append, remove } = useFieldArray({
        name,
    })

    useEffect(() => {
        if (!fields.length) {
            append(defaultValues)
        }
    }, [append, defaultValues, fields.length])

    return (
        <div className={css.container}>
            <div className={css.inputs}>
                {fields.map((field, index) => (
                    <TimeScheduleRow
                        key={field.id}
                        {...field}
                        index={index}
                        onRemove={remove}
                        name={name}
                        isRemovable={fields.length > 1}
                        root={root}
                    />
                ))}
            </div>

            <Button
                onClick={() => append(defaultValues)}
                leadingIcon="add"
                intent="secondary"
            >
                Add time range
            </Button>
        </div>
    )
}
