import { forwardRef } from 'react'

import { useFormContext } from '@repo/forms'

import { LegacySelectField as SelectField } from '@gorgias/axiom'

import {
    SUPPORTED_UI_DATA_TYPE_VALUES,
    SUPPORTED_UI_DATA_TYPES,
} from 'custom-fields/constants'
import { getUIDataType } from 'custom-fields/helpers/getUIDataType'
import type { CustomField, SupportedUIDataType } from 'custom-fields/types'

import { EXPRESSION_OPERATORS_BY_UI_DATA_TYPE } from '../../constants'

type FieldFieldProps = {
    customFieldDefinitions: CustomField[]
    value?: string | number
    onChange: (value: string | number) => void
    index: number
}

export const FieldField = forwardRef(function FieldField(
    { customFieldDefinitions, onChange, value, index }: FieldFieldProps,
    __ref,
) {
    const { setValue } = useFormContext()
    const pickedDefinition = customFieldDefinitions?.find(
        ({ id }) => id === value,
    )

    return (
        <SelectField
            options={customFieldDefinitions.filter(
                ({ definition }) =>
                    getUIDataType(
                        definition.data_type,
                        definition.input_settings.input_type,
                    ) !== SUPPORTED_UI_DATA_TYPES.INPUT_TEXT,
            )}
            selectedOption={pickedDefinition || null}
            optionMapper={({ label, definition }) => ({
                value: label,
                subtext:
                    SUPPORTED_UI_DATA_TYPE_VALUES[
                        getUIDataType(
                            definition.data_type,
                            definition.input_settings.input_type,
                        ) as SupportedUIDataType
                    ].name,
            })}
            placeholder="Select ticket field"
            onChange={({ id, definition }: CustomField) => {
                onChange(id)
                setValue(
                    `expression.${index}.operator`,
                    EXPRESSION_OPERATORS_BY_UI_DATA_TYPE[
                        getUIDataType(
                            definition.data_type,
                            definition.input_settings.input_type,
                        ) as SupportedUIDataType
                    ][0],
                )
                setValue(`expression.${index}.values`, null)
            }}
        />
    )
})
