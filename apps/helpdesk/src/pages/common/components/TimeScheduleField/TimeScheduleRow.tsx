import { useEffect, useMemo } from 'react'

import { get } from 'lodash'

import { Box, IconButton } from '@gorgias/axiom'

import { FormField, useFormContext } from 'core/forms'
import SelectDropdownField from 'pages/common/forms/SelectDropdownField'
import { DAYS_OPTIONS } from 'pages/settings/businessHours/constants'

import TimeInputField from './TimeInputField'

import css from './TimeScheduleRow.less'

const TO_TIME_ERROR_MESSAGE = 'To time must be greater than From time'

type Props = {
    index: number
    name: string
    onRemove: (index?: number) => void
    isRemovable: boolean
    root?: HTMLElement
}

export default function TimeScheduleRow({
    name,
    index,
    isRemovable,
    onRemove,
    root,
}: Props) {
    const namePrefix = useMemo(() => `${name}.${index}`, [name, index])

    const {
        watch,
        setError,
        formState: { errors },
    } = useFormContext()
    const toTime = watch(`${namePrefix}.to_time`)
    const fromTime = watch(`${namePrefix}.from_time`)

    useEffect(() => {
        // Handle midnight edge case: 00:00 should be treated as midnight of next day (24:00)
        const isToTimeMidnight = toTime === '00:00'
        const isValidTimeRange = isToTimeMidnight || toTime > fromTime

        if (!isValidTimeRange) {
            setError(
                `${namePrefix}.to_time`,
                {
                    message: TO_TIME_ERROR_MESSAGE,
                },
                { shouldFocus: true },
            )
        } else if (
            get(errors, `${namePrefix}.to_time`)?.message ===
            TO_TIME_ERROR_MESSAGE
        ) {
            setError(`${namePrefix}.to_time`, { message: undefined })
        }
    }, [toTime, fromTime, namePrefix, setError, errors])

    return (
        <div className={css.container}>
            <div className={css.selectField}>
                <FormField
                    name={`${namePrefix}.days`}
                    field={SelectDropdownField<string>}
                    options={DAYS_OPTIONS.map((option) => option.label)}
                    outputTransform={(option) =>
                        DAYS_OPTIONS.find(
                            (daysOption) => daysOption.label === option,
                        )?.value
                    }
                    inputTransform={(option) => {
                        return (
                            DAYS_OPTIONS.find(
                                (daysOption) => daysOption.value === option,
                            )?.label ?? ''
                        )
                    }}
                    root={root}
                />
            </div>

            <FormField
                name={`${namePrefix}.from_time`}
                field={TimeInputField}
            />

            <Box pt="var(--layout-spacing-xxs)">to</Box>

            <FormField name={`${namePrefix}.to_time`} field={TimeInputField} />

            {isRemovable && (
                <IconButton
                    fillStyle="ghost"
                    intent="destructive"
                    onClick={() => onRemove(index)}
                    icon="close"
                />
            )}
        </div>
    )
}
