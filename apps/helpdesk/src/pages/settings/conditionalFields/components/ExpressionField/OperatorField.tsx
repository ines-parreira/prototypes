import { forwardRef } from 'react'

import { SelectField } from '@gorgias/axiom'
import { ExpressionOperator } from '@gorgias/helpdesk-queries'

import { useFormContext } from 'core/forms'
import { getUIDataType } from 'custom-fields/helpers/getUIDataType'
import { CustomField, SupportedUIDataType } from 'custom-fields/types'

import {
    EXPRESSION_OPERATORS_BY_UI_DATA_TYPE,
    EXPRESSION_OPERATORS_LABELS,
} from '../../constants'

type OperatorFieldProps = {
    pickedDefinition?: CustomField
    value?: string | number | null
    onChange: (value: string | number) => void
    index: number
}

export const OperatorField = forwardRef(function OperatorField(
    { pickedDefinition, onChange, value, index }: OperatorFieldProps,
    __ref,
) {
    const { setValue } = useFormContext()
    const UIDataType = pickedDefinition
        ? (getUIDataType(
              pickedDefinition.definition.data_type,
              pickedDefinition.definition.input_settings.input_type,
          ) as SupportedUIDataType)
        : undefined

    return (
        <SelectField
            options={
                (UIDataType &&
                    EXPRESSION_OPERATORS_BY_UI_DATA_TYPE[UIDataType]) ||
                ([] as ExpressionOperator[])
            }
            onChange={(operator: ExpressionOperator) => {
                onChange(operator)
                if (operator === ExpressionOperator.IsNotEmpty) {
                    setValue(`expression.${index}.values`, null)
                }
            }}
            optionMapper={(operator) => ({
                value: EXPRESSION_OPERATORS_LABELS[operator],
            })}
            selectedOption={(value as ExpressionOperator) || null}
            isDisabled={!pickedDefinition}
        />
    )
})
