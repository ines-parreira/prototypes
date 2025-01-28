import {ExpressionOperator} from '@gorgias/api-queries'
import React from 'react'
import {useWatch} from 'react-hook-form'

import FormField from 'components/Form/FormField'
import {CustomField} from 'custom-fields/types'
import IconButton from 'pages/common/components/button/IconButton'

import css from './ExpressionRow.less'
import {FieldField} from './FieldField'
import {OperatorField} from './OperatorField'
import {Pill} from './Pill'
import {ValueField} from './ValueField'

type ExpressionRowProps = {
    index: number
    customFieldDefinitions: CustomField[]
    onRemove: (index?: number) => void
}

export const ExpressionRow = function ExpressionRow({
    index,
    customFieldDefinitions,
    onRemove,
}: ExpressionRowProps) {
    const [field, operator] = useWatch({
        name: [`expression.${index}.field`, `expression.${index}.operator`],
    })
    const pickedDefinition = customFieldDefinitions?.find(
        ({id}) => id === field
    )

    return (
        <div className={css.row}>
            {index > 0 && <Pill color="grey">And</Pill>}
            <Pill>Ticket Field</Pill>
            <span className={css.fieldSource}>
                <FormField
                    name={`expression.${index}.field`}
                    field={FieldField}
                    index={index}
                    customFieldDefinitions={customFieldDefinitions}
                />
            </span>
            <span className={css.operatorContainer}>
                <FormField
                    name={`expression.${index}.operator`}
                    field={OperatorField}
                    pickedDefinition={pickedDefinition}
                />
            </span>
            <span className={css.valueContainer}>
                <FormField
                    name={`expression.${index}.values`}
                    field={ValueField}
                    pickedDefinition={pickedDefinition}
                    index={index}
                    isRequired={operator !== ExpressionOperator.IsNotEmpty}
                    isDisabled={operator === ExpressionOperator.IsNotEmpty}
                />
            </span>

            <IconButton
                fillStyle="ghost"
                intent="destructive"
                onClick={() => onRemove(index)}
            >
                close
            </IconButton>
        </div>
    )
}
