import { produce } from 'immer'

import type {
    ConditionSchema,
    EqualsSchema,
} from 'pages/automate/workflows/models/conditions.types'
import SelectField from 'pages/common/forms/SelectField/SelectField'

interface Props {
    condition: EqualsSchema<boolean>
    onChange: (condition: ConditionSchema) => void
    isDisabled?: boolean
}
export const BooleanConditionType = ({
    condition,
    onChange,
    isDisabled,
}: Props) => {
    const key = Object.keys(condition)[0] as AllKeys<typeof condition>
    const schema = condition[key]

    if (!schema) {
        return null
    }

    const value = Number(schema[1] ?? false)

    return (
        <SelectField
            showSelectedOption
            value={value}
            onChange={(nextValue) => {
                onChange(
                    produce(condition, (draft) => {
                        const schema = draft[key]

                        if (!schema) {
                            return
                        }

                        schema[1] = Boolean(nextValue)
                    }),
                )
            }}
            options={[
                {
                    label: 'true',
                    value: 1,
                },
                {
                    label: 'false',
                    value: 0,
                },
            ]}
            disabled={isDisabled}
        />
    )
}
