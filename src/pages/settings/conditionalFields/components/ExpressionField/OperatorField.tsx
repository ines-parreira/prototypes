import {
    CustomFieldConditionExpressionField,
    ExpressionOperator,
} from '@gorgias/api-queries'
import {SelectField} from '@gorgias/merchant-ui-kit'
import React, {forwardRef} from 'react'

import {getUIDataType} from 'custom-fields/helpers/getUIDataType'
import {CustomField, SupportedUIDataType} from 'custom-fields/types'

import {
    EXPRESSION_OPERATORS_BY_UI_DATA_TYPE,
    EXPRESSION_OPERATORS_LABELS,
} from '../../constants'

type OperatorFieldProps = {
    pickedDefinition?: CustomField
    value?: CustomFieldConditionExpressionField | null
    onChange: (value: CustomFieldConditionExpressionField) => void
}

export const OperatorField = forwardRef(function OperatorField(
    {pickedDefinition, onChange, value}: OperatorFieldProps,
    __ref
) {
    const UIDataType = pickedDefinition
        ? (getUIDataType(
              pickedDefinition.definition.data_type,
              pickedDefinition.definition.input_settings.input_type
          ) as SupportedUIDataType)
        : undefined

    return (
        <SelectField
            options={
                (UIDataType &&
                    EXPRESSION_OPERATORS_BY_UI_DATA_TYPE[UIDataType]) ||
                ([] as ExpressionOperator[])
            }
            onChange={onChange}
            optionMapper={(operator) => ({
                value: EXPRESSION_OPERATORS_LABELS[operator],
            })}
            selectedOption={(value as ExpressionOperator) || null}
            isDisabled={!pickedDefinition}
        />
    )
})
