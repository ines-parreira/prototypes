import React from 'react'
import {produce} from 'immer'
import {
    ConditionSchema,
    DoesNotExistSchema,
    ExistsSchema,
    NumberSchema,
} from 'pages/automate/workflows/models/conditions.types'
import NumberInput from 'pages/common/forms/input/NumberInput'
import css from '../ConditionsNodeEditor.less'

interface Props {
    condition: Exclude<NumberSchema, ExistsSchema | DoesNotExistSchema>
    onChange: (condition: ConditionSchema) => void
    shouldShowErrors?: boolean
}
export const NumberConditionType = ({
    condition,
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
            value={value}
            hasError={shouldShowErrors && !value}
            onChange={(nextValue) => {
                onChange(
                    produce(condition, (draft) => {
                        const schema = draft[key]

                        if (!schema) {
                            return
                        }

                        schema[1] = nextValue ?? 0
                    })
                )
            }}
        />
    )
}
