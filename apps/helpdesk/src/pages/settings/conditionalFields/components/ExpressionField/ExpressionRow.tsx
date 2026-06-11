import { FormField, useWatch } from '@repo/forms'

import { ExpressionOperator } from '@gorgias/helpdesk-types'

import type { CustomField } from 'custom-fields/types'
import { IconButton } from 'pages/common/components/button/IconButton'

import { FieldField } from './FieldField'
import { OperatorField } from './OperatorField'
import { Pill } from './Pill'
import { ValueField } from './ValueField'

import css from './ExpressionRow.less'

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
        ({ id }) => id === field,
    )

    return (
        <div className={css.row}>
            {index > 0 && <Pill color="light">And</Pill>}
            <Pill>Ticket Field</Pill>
            <span className={css.fieldSource}>
                <FormField name={`expression.${index}.field`}>
                    {(formField) => (
                        <FieldField
                            {...formField}
                            index={index}
                            customFieldDefinitions={customFieldDefinitions}
                        />
                    )}
                </FormField>
            </span>
            <span className={css.operatorContainer}>
                <FormField name={`expression.${index}.operator`}>
                    {(formField) => (
                        <OperatorField
                            {...formField}
                            pickedDefinition={pickedDefinition}
                            index={index}
                        />
                    )}
                </FormField>
            </span>
            <span className={css.valueContainer}>
                <FormField
                    name={`expression.${index}.values`}
                    isRequired={operator !== ExpressionOperator.IsNotEmpty}
                    isDisabled={operator === ExpressionOperator.IsNotEmpty}
                >
                    {(formField) => (
                        <ValueField
                            {...formField}
                            pickedDefinition={pickedDefinition}
                            index={index}
                        />
                    )}
                </FormField>
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
