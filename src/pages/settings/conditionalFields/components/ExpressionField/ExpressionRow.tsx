import {
    CustomFieldConditionExpression,
    CustomFieldConditionExpressionValues,
    ExpressionFieldSource,
    ExpressionOperator,
} from '@gorgias/api-queries'
import {SelectInput} from '@gorgias/merchant-ui-kit'
import {produce} from 'immer'
import React, {useCallback} from 'react'

import {
    SUPPORTED_UI_DATA_TYPES,
    SUPPORTED_UI_DATA_TYPE_VALUES,
} from 'custom-fields/constants'
import {getUIDataType} from 'custom-fields/helpers/getUIDataType'
import {CustomField, SupportedUIDataType} from 'custom-fields/types'
import IconButton from 'pages/common/components/button/IconButton'

import {EXPRESSION_OPERATORS_BY_UI_DATA_TYPE} from '../../constants'
import css from './ExpressionRow.less'
import {Pill} from './Pill'
import {ValuePicker} from './ValuePicker'

type ExpressionRowProps = {
    index: number
    expressions: CustomFieldConditionExpression[]
    expression: CustomFieldConditionExpression
    customFieldDefinitions: CustomField[]
    customFieldDefinition: CustomField | undefined
    onChange: (expressions: CustomFieldConditionExpression[]) => void
    removePlaceholderRowIfNeeded: () => void
}

export function ExpressionRow({
    index,
    expressions,
    expression,
    customFieldDefinitions,
    customFieldDefinition,
    onChange,
    removePlaceholderRowIfNeeded,
}: ExpressionRowProps) {
    const handleSourceChange = useCallback(
        ({id, definition}: CustomField) => {
            onChange(
                produce(expressions, (draft) => {
                    draft[index] = {
                        field_source: ExpressionFieldSource.TicketCustomFields,
                        field: id,
                        operator:
                            EXPRESSION_OPERATORS_BY_UI_DATA_TYPE[
                                getUIDataType(
                                    definition.data_type,
                                    definition.input_settings.input_type
                                ) as SupportedUIDataType
                            ][0],
                        values: [],
                    }
                })
            )
            removePlaceholderRowIfNeeded()
        },
        [expressions, index, onChange, removePlaceholderRowIfNeeded]
    )

    const handleOperatorChange = useCallback(
        (operator) => {
            onChange(
                produce(expressions, (draft) => {
                    draft[index].operator = operator
                })
            )
        },
        [expressions, index, onChange]
    )

    const handleValueChange = useCallback(
        (values: CustomFieldConditionExpressionValues) => {
            onChange(
                produce(expressions, (draft) => {
                    draft[index].values = values
                })
            )
        },
        [expressions, index, onChange]
    )

    const handleDelete = useCallback(() => {
        removePlaceholderRowIfNeeded()
        onChange(expressions.filter((_, i) => i !== index))
    }, [expressions, index, onChange, removePlaceholderRowIfNeeded])

    const expressionFieldUIDataType = customFieldDefinition
        ? (getUIDataType(
              customFieldDefinition.definition.data_type,
              customFieldDefinition.definition.input_settings.input_type
          ) as SupportedUIDataType)
        : undefined

    return (
        <div className={css.row}>
            {index > 0 && <Pill color="grey">And</Pill>}
            <Pill>Ticket Field</Pill>
            <span className={css.fieldSource}>
                <SelectInput
                    options={customFieldDefinitions.filter(
                        ({definition}) =>
                            getUIDataType(
                                definition.data_type,
                                definition.input_settings.input_type
                            ) !== SUPPORTED_UI_DATA_TYPES.INPUT_TEXT
                    )}
                    selectedOption={customFieldDefinitions.find(
                        (definition) => definition.id === expression.field
                    )}
                    optionMapper={({label, definition}) => ({
                        value: label,
                        subtext:
                            SUPPORTED_UI_DATA_TYPE_VALUES[
                                getUIDataType(
                                    definition.data_type,
                                    definition.input_settings.input_type
                                ) as SupportedUIDataType
                            ].name,
                    })}
                    placeholder="Select ticket field"
                    onChange={handleSourceChange}
                />
            </span>
            <span className={css.operatorContainer}>
                <SelectInput
                    options={
                        expressionFieldUIDataType
                            ? EXPRESSION_OPERATORS_BY_UI_DATA_TYPE[
                                  expressionFieldUIDataType
                              ]
                            : ([] as ExpressionOperator[])
                    }
                    selectedOption={expression.operator}
                    isDisabled={!customFieldDefinition?.definition}
                    onChange={handleOperatorChange}
                />
            </span>
            <span className={css.valueContainer}>
                <ValuePicker
                    field={customFieldDefinition}
                    values={expression.values}
                    onChange={handleValueChange}
                    index={index}
                    isDisabled={
                        expression.operator === ExpressionOperator.IsNotEmpty
                    }
                />
            </span>

            <IconButton
                fillStyle="ghost"
                intent="destructive"
                onClick={handleDelete}
            >
                close
            </IconButton>
        </div>
    )
}
