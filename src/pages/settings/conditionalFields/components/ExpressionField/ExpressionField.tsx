import React from 'react'
import {useFieldArray, useFormState} from 'react-hook-form'

import {OBJECT_TYPES} from 'custom-fields/constants'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import Caption from 'pages/common/forms/Caption/Caption'

import {DEFAULT_EXPRESSION_RULE} from '../../constants'
import {AddButton} from './AddButton'
import css from './ExpressionField.less'
import {ExpressionRow} from './ExpressionRow'

type ExpressionFieldProps = {
    className?: string
}

export const ExpressionField = function ExpressionField({
    className,
}: ExpressionFieldProps) {
    const {errors} = useFormState({name: 'expression'})
    const {data} = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.TICKET,
    })
    const {
        fields,
        remove: handleRemove,
        append: handleAdd,
    } = useFieldArray({
        rules: {
            required: 'You need to provide at least one requirement',
        },
        name: 'expression',
    })
    const customFieldDefinitions = data?.data ?? []

    return (
        <div className={className}>
            <div className={css.mbS}>
                {fields.map((field, index) => (
                    <ExpressionRow
                        key={field.id}
                        index={index}
                        customFieldDefinitions={customFieldDefinitions}
                        onRemove={handleRemove}
                    />
                ))}
            </div>
            <AddButton onClick={() => handleAdd(DEFAULT_EXPRESSION_RULE)} />
            {errors?.expression?.root?.message && (
                <Caption error={errors.expression.root.message} />
            )}
        </div>
    )
}
