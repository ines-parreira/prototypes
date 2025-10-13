import { useEffect, useMemo } from 'react'

import cn from 'classnames'
import { get } from 'lodash'

import { LegacyIconButton as IconButton } from '@gorgias/axiom'

import { FormField, useFormContext } from 'core/forms'
import SelectDropdownField from 'pages/common/forms/SelectDropdownField'
import {
    ALWAYS_ON_OPTION_LABEL,
    DAYS_OPTIONS,
    DAYS_OPTIONS_WITHOUT_ALWAYS_ON,
    EVERYDAY_OPTION_LABEL,
    EVERYDAY_OPTION_VALUE,
} from 'pages/settings/businessHours/constants'

import TimeInputField from './TimeInputField'

import css from './TimeScheduleRow.less'

const TO_TIME_ERROR_MESSAGE = 'To time must be greater than From time'

type Props = {
    index: number
    name: string
    onRemove: (index?: number) => void
    isRemovable: boolean
    root?: HTMLElement
    daysOptions?: { label: string; value: string }[]
}

export default function TimeScheduleRow({
    name,
    index,
    isRemovable,
    onRemove,
    root,
    daysOptions = DAYS_OPTIONS,
}: Props) {
    const namePrefix = useMemo(() => `${name}.${index}`, [name, index])

    const {
        watch,
        setError,
        setValue,
        formState: { errors },
    } = useFormContext()
    const days = watch(`${namePrefix}.days`)
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

    const daysFieldOutputTransform = (option: string) => {
        if (option === ALWAYS_ON_OPTION_LABEL) {
            setValue(`${namePrefix}.to_time`, '00:00')
            setValue(`${namePrefix}.from_time`, '00:00')
        } else if (
            option === EVERYDAY_OPTION_LABEL &&
            fromTime === '00:00' &&
            toTime === '00:00'
        ) {
            setValue(`${namePrefix}.to_time`, '23:59')
        }

        return (
            daysOptions.find((daysOption) => daysOption.label === option)
                ?.value ?? ''
        )
    }

    const isAlwaysOn =
        days === EVERYDAY_OPTION_VALUE &&
        toTime === '00:00' &&
        fromTime === '00:00'

    return (
        <div className={css.container}>
            <div className={css.selectField}>
                <FormField
                    name={`${namePrefix}.days`}
                    field={SelectDropdownField<string>}
                    options={daysOptions.map((option) => option.label)}
                    outputTransform={(option) =>
                        daysFieldOutputTransform(option)
                    }
                    inputTransform={(option) => {
                        return daysFieldInputTransform(option, toTime, fromTime)
                    }}
                    root={root}
                />
            </div>

            <div className={cn(css.timeInputs, { [css.hidden]: isAlwaysOn })}>
                <FormField
                    isDisabled={isAlwaysOn}
                    name={`${namePrefix}.from_time`}
                    field={TimeInputField}
                />
                <div>to</div>
                <FormField
                    isDisabled={isAlwaysOn}
                    name={`${namePrefix}.to_time`}
                    field={TimeInputField}
                />
            </div>

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

const daysFieldInputTransform = (
    option: string,
    toTime: string,
    fromTime: string,
): string => {
    if (option === EVERYDAY_OPTION_VALUE) {
        return toTime === '00:00' && fromTime === '00:00'
            ? ALWAYS_ON_OPTION_LABEL
            : EVERYDAY_OPTION_LABEL
    }

    return (
        DAYS_OPTIONS_WITHOUT_ALWAYS_ON.find(
            (daysOption) => daysOption.value === option,
        )?.label ?? ''
    )
}
