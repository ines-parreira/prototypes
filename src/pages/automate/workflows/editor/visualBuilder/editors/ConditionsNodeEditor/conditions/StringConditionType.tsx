import React from 'react'
import {produce} from 'immer'
import {
    ConditionSchema,
    DoesNotExistSchema,
    ExistsSchema,
    StringSchema,
} from 'pages/automate/workflows/models/conditions.types'
import InputField from 'pages/common/forms/input/InputField'
import css from '../ConditionsNodeEditor.less'

interface Props {
    condition: Exclude<StringSchema, ExistsSchema | DoesNotExistSchema>
    onChange: (condition: ConditionSchema) => void
    shouldShowErrors?: boolean
}
export const StringConditionType = ({
    condition,
    onChange,
    shouldShowErrors,
}: Props) => {
    const key = Object.keys(condition)[0] as AllKeys<typeof condition>
    const schema = condition[key]

    if (!schema) {
        return null
    }

    const value = String(schema[1] ?? '')
    const hasError = shouldShowErrors && !value

    return (
        <InputField
            className={css.input}
            placeholder="value"
            onChange={(nextValue) => {
                onChange(
                    produce(condition, (draft) => {
                        const schema = draft[key]

                        if (!schema) {
                            return
                        }

                        schema[1] = nextValue
                    })
                )
            }}
            error={hasError && 'Enter a value'}
            hasError={hasError}
            value={value}
        />
    )
}
