import React, { useEffect, useState } from 'react'

import classNames from 'classnames'

import { CreateSlaPolicyBody } from '@gorgias/api-types'

import {
    FormField,
    useController,
    useFieldArray,
    useFormContext,
} from 'core/forms'
import Caption from 'pages/common/forms/Caption/Caption'
import ToggleInput from 'pages/common/forms/ToggleInput'
import settingsCss from 'pages/settings/settings.less'

import NumberInputField from './NumberInputField'
import TimeUnitSelectBox from './TimeUnitSelectBox'

import css from './MetricsFieldArray.less'

const fieldTexts = {
    FRT: {
        label: 'First response time',
        tooltip:
            'The time between the first message from a customer and the first response from an agent.',
    },
    RT: {
        label: 'Resolution time',
        tooltip:
            'The time from the first message received from the customer until the ticket is closed.',
    },
}

export default function MetricsFieldArray() {
    const { fields } = useFieldArray<CreateSlaPolicyBody>({
        name: 'metrics',
    })

    const {
        fieldState: { error },
    } = useController({
        name: 'metrics',
    })

    const { setValue, getValues } = useFormContext()

    const [toggleState, setToggleState] = useState<boolean[]>([])
    const [tempThresholdValues, setTempThresholdValues] = useState<
        (number | undefined)[]
    >([])

    useEffect(() => {
        setToggleState(fields.map((field) => !!field.threshold))
    }, [fields])

    const handleToggle = (nextValue: boolean, index: number) => {
        setToggleState((prev) => {
            const next = [...prev]
            next[index] = nextValue
            return next
        })

        if (!nextValue) {
            const currentValue = getValues(`metrics.${index}.threshold`)
            if (currentValue) {
                setTempThresholdValues((prev) => {
                    const next = [...prev]
                    next[index] = currentValue
                    return next
                })
                setValue(`metrics.${index}.threshold`, '', {
                    shouldDirty: true,
                })
            }
        } else {
            const previousValue = tempThresholdValues[index]
            previousValue &&
                setValue(`metrics.${index}.threshold`, previousValue, {
                    shouldDirty: true,
                })
        }
    }

    return (
        <div className={settingsCss.mb48}>
            <div>
                {fields.map((field, index) => (
                    <div className={classNames(settingsCss.mb24)} key={index}>
                        <ToggleInput
                            caption={fieldTexts[field.name].tooltip}
                            isToggled={toggleState[index]}
                            onClick={(nextValue) => {
                                handleToggle(nextValue, index)
                            }}
                            className={settingsCss.mb16}
                        >
                            {fieldTexts[field.name].label}
                        </ToggleInput>
                        <div className={css.inputGroup}>
                            <FormField
                                name={`metrics.${index}.threshold`}
                                field={NumberInputField}
                                isRequired
                                hasControls={false}
                                placeholder={
                                    String(tempThresholdValues[index] || '') ||
                                    '0'
                                }
                                min={1}
                                wrapperClassName={css.input}
                                allowEmptyString
                                isDisabled={!toggleState[index]}
                            />
                            <FormField
                                name={`metrics.${index}.unit`}
                                field={TimeUnitSelectBox}
                                className={css.input}
                                isDisabled={!toggleState[index]}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {!!error && <Caption error={error.message} />}
        </div>
    )
}
