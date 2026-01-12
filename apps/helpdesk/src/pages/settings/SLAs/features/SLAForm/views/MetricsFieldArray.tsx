import { useEffect, useState } from 'react'

import {
    FormField,
    useController,
    useFieldArray,
    useFormContext,
} from '@repo/forms'

import { Box, ToggleField } from '@gorgias/axiom'
import type { CreateSLAPolicy } from '@gorgias/helpdesk-types'

import Caption from 'pages/common/forms/Caption/Caption'

import NumberInputField from './NumberInputField'
import TimeUnitSelectField from './TimeUnitSelectField'

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

export function MetricsFieldArray() {
    const { fields } = useFieldArray<CreateSLAPolicy>({
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
        <Box>
            <Box flexDirection="column" gap="sm">
                {fields.map((field, index) => {
                    if (field.name === 'WAIT_TIME') return null
                    return (
                        <Box flexDirection="column" gap="xs" key={index}>
                            <ToggleField
                                caption={fieldTexts[field.name].tooltip}
                                value={toggleState[index]}
                                onChange={(nextValue: boolean) => {
                                    handleToggle(nextValue, index)
                                }}
                                label={fieldTexts[field.name].label}
                            />
                            <Box gap="sm">
                                <FormField
                                    name={`metrics.${index}.threshold`}
                                    field={NumberInputField}
                                    isRequired
                                    hasControls={false}
                                    placeholder={
                                        String(
                                            tempThresholdValues[index] || '',
                                        ) || '0'
                                    }
                                    min={1}
                                    wrapperClassName={css.input}
                                    allowEmptyString
                                    isDisabled={!toggleState[index]}
                                />
                                <TimeUnitSelectField
                                    name={`metrics.${index}.unit`}
                                    isDisabled={!toggleState[index]}
                                />
                            </Box>
                        </Box>
                    )
                })}
            </Box>
            {!!error && <Caption error={error.message} />}
        </Box>
    )
}
