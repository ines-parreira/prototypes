import {CustomFieldConditionExpressionValues} from '@gorgias/api-queries'
import {SelectInput} from '@gorgias/merchant-ui-kit'
import React, {forwardRef} from 'react'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import {getStealthLabel} from 'custom-fields/components/MultiLevelSelect/helpers/getLabels'
import {CustomInputProps} from 'custom-fields/components/MultiLevelSelect/types'
import {
    isDropdownInput,
    isNumberInput,
    isTextInput,
} from 'custom-fields/helpers/typeGuards'
import {CustomField} from 'custom-fields/types'
import NumberInput from 'pages/common/forms/input/NumberInput'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './ValuePicker.less'

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
    ({isOpen, ...props}, ref) => {
        return (
            <TextInput
                {...props}
                ref={ref}
                onChange={() => undefined}
                suffix={
                    <span className={`material-icons ${css.dropdownArrow}`}>
                        {isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
                    </span>
                }
            />
        )
    }
)

export function ValuePicker({
    field,
    values,
    onChange,
    isDisabled,
    index,
}: {
    field?: CustomField
    values?: CustomFieldConditionExpressionValues
    onChange: (value: CustomFieldConditionExpressionValues) => void
    isDisabled: boolean
    index: number
}) {
    if (!field || isDisabled) {
        return (
            <SelectInput
                options={[]}
                isDisabled
                placeholder="Select field value(s)"
                onChange={() => undefined}
            />
        )
    }
    if (isTextInput(field)) {
        return (
            <TextInput
                placeholder="Enter field value"
                value={
                    (values && typeof values[0] === 'string' && values?.[0]) ||
                    ''
                }
                onChange={(value) => {
                    onChange([value])
                }}
            />
        )
    }
    if (isNumberInput(field)) {
        const min = field.definition.input_settings.min
        const max = field.definition.input_settings.max
        return (
            <NumberInput
                value={
                    (values && typeof values[0] === 'number' && values?.[0]) ||
                    undefined
                }
                onChange={(value) => {
                    onChange(typeof value === 'number' ? [value] : [])
                }}
                min={min ? Number(min) : undefined}
                max={max ? Number(max) : undefined}
            />
        )
    }
    if (isDropdownInput(field)) {
        if (field.definition.data_type === 'boolean') {
            const options = [
                {value: true, label: 'Yes'},
                {value: false, label: 'No'},
            ]
            return (
                <SelectInput
                    placeholder="Select field value"
                    options={options}
                    optionMapper={({label}) => ({value: label})}
                    selectedOption={
                        values && typeof values[0] === 'boolean'
                            ? options.find(
                                  (option) => option.value === values[0]
                              )
                            : undefined
                    }
                    onChange={({value}) => {
                        onChange([value])
                    }}
                />
            )
        }
        return (
            <MultiLevelSelect
                inputId={`expression-value-${field.id}-${index}`}
                placeholder="Select field value(s)"
                choices={field.definition.input_settings.choices}
                allowMultiValues
                value={values ? values : []}
                onChange={(values = []) => {
                    onChange(values as string[])
                }}
                CustomInput={CustomInput}
                customDisplayValue={(values = []) => {
                    if (values.length >= 4) {
                        return `${values.length} fields selected`
                    }
                    return values.map(getStealthLabel).join(', ')
                }}
                dropdownAutoWidth
            />
        )
    }
    return null
}
