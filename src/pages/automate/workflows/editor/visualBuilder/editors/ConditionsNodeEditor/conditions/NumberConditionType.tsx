import React from 'react'
import {produce} from 'immer'
import {
    ConditionSchema,
    DoesNotExistSchema,
    ExistsSchema,
    NumberSchema,
} from 'pages/automate/workflows/models/conditions.types'
import NumberInput from 'pages/common/forms/input/NumberInput'
import {WorkflowVariableFormat} from 'pages/automate/workflows/models/variables.types'
import css from '../ConditionsNodeEditor.less'

interface Props {
    condition: Exclude<NumberSchema, ExistsSchema | DoesNotExistSchema>
    format: WorkflowVariableFormat | undefined
    onChange: (condition: ConditionSchema) => void
    shouldShowErrors?: boolean
}

const getDisplayValue = (
    value: number,
    format: WorkflowVariableFormat | undefined
) => {
    switch (format) {
        case 'currency':
            return value * 100
        default:
            return value
    }
}

const getValueFromDisplayValue = (
    displayValue: number,
    format: WorkflowVariableFormat | undefined
) => {
    switch (format) {
        case 'currency':
            return displayValue / 100
        default:
            return displayValue
    }
}

export const NumberConditionType = ({
    condition,
    format,
    onChange,
    shouldShowErrors,
}: Props) => {
    const key = Object.keys(condition)[0] as AllKeys<typeof condition>

    const schema = condition[key]

    if (!schema) {
        return null
    }

    const value = Number(schema[1] ?? 0)

    return (
        <NumberInput
            className={css.input}
            placeholder="value"
            value={getDisplayValue(value, format)}
            hasError={shouldShowErrors && !value}
            onChange={(nextValue) => {
                onChange(
                    produce(condition, (draft) => {
                        const schema = draft[key]

                        if (!schema) {
                            return
                        }

                        schema[1] = getValueFromDisplayValue(
                            nextValue ?? 0,
                            format
                        )
                    })
                )
            }}
        />
    )
}
