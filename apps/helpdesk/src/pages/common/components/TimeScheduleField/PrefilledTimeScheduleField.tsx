import { useEffect } from 'react'

import { useFieldArray } from '@repo/forms'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { BusinessHoursTimeframe } from '@gorgias/helpdesk-types'

import {
    DAYS_OPTIONS_WITHOUT_ALWAYS_ON,
    DEFAULT_BUSINESS_HOUR,
} from 'pages/settings/businessHours/constants'

import TimeScheduleRow from './TimeScheduleRow'

import css from './TimeScheduleField.less'

type Props = {
    name: string
    root?: HTMLElement
    defaultValues?: BusinessHoursTimeframe
    daysOptions?: { label: string; value: string }[]
}

export default function PrefilledTimeScheduleField({
    name,
    root,
    defaultValues = DEFAULT_BUSINESS_HOUR,
    daysOptions = DAYS_OPTIONS_WITHOUT_ALWAYS_ON,
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
                        daysOptions={daysOptions}
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
