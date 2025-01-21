import {
    ExpressionOperator,
    ExpressionFieldSource,
    CustomFieldConditionExpression,
} from '@gorgias/api-queries'
import React, {forwardRef} from 'react'

import {OBJECT_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import Button from 'pages/common/components/button/Button'
import Caption from 'pages/common/forms/Caption/Caption'

import css from './ExpressionField.less'
import {ExpressionRow} from './ExpressionRow'

interface ExpressionFieldProps {
    value: CustomFieldConditionExpression[]
    onChange: (value: CustomFieldConditionExpression[]) => void
    error?: string
    className?: string
}

export const ExpressionField = forwardRef(function ExpressionField(
    {value: expressions, onChange, error, className}: ExpressionFieldProps,
    __ref
) {
    const [isAdding, setIsAdding] = React.useState(false)
    const {data} = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.TICKET,
    })

    const withAdditionExpressions = isAdding
        ? [
              ...expressions,
              {
                  field_source: ExpressionFieldSource.TicketCustomFields,
                  field: '',
                  operator: ExpressionOperator.IsOneOf,
                  values: [],
              },
          ]
        : expressions

    const customFieldDefinitions = data?.data ?? []

    return (
        <div className={className}>
            <div className={css.mbS}>
                {withAdditionExpressions.map((expression, index) => (
                    <ExpressionRow
                        key={index}
                        index={index}
                        expressions={expressions}
                        expression={expression}
                        onChange={onChange}
                        customFieldDefinitions={customFieldDefinitions}
                        customFieldDefinition={customFieldDefinitions.find(
                            (definition) => definition.id === expression.field
                        )}
                        removePlaceholderRowIfNeeded={() =>
                            isAdding &&
                            index === withAdditionExpressions.length - 1 &&
                            setIsAdding(false)
                        }
                    />
                ))}
            </div>
            <Button
                type="button"
                intent="secondary"
                onClick={() => {
                    setIsAdding(true)
                }}
                isDisabled={isAdding}
                trailingIcon="add"
            >
                Add requirements
            </Button>
            {error && <Caption error={error} />}
        </div>
    )
})
