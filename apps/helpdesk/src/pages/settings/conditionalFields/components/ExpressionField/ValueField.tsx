import { forwardRef, ReactNode } from 'react'

import { LegacySelectField as SelectField } from '@gorgias/axiom'
import { CustomFieldConditionExpression } from '@gorgias/helpdesk-queries'

import MultiLevelSelect from 'custom-fields/components/MultiLevelSelect'
import { getShortValueLabel } from 'custom-fields/helpers/getValueLabels'
import {
    isDropdownInput,
    isNumberInput,
    isTextInput,
} from 'custom-fields/helpers/typeGuards'
import { CustomField } from 'custom-fields/types'
import Caption from 'pages/common/forms/Caption/Caption'
import NumberInput from 'pages/common/forms/input/NumberInput'
import TextInput from 'pages/common/forms/input/TextInput'

import { CustomDropdownInput } from './CustomDropdownInput'

type ValueFieldProps = {
    pickedDefinition?: CustomField
    value: CustomFieldConditionExpression['values']
    onChange: (value: CustomFieldConditionExpression['values']) => void
    isDisabled: boolean
    index: number
    error?: string
}

export const ValueField = forwardRef(function ValueField(
    {
        pickedDefinition,
        value,
        isDisabled,
        onChange,
        index,
        error,
    }: ValueFieldProps,
    __ref,
) {
    let Input: ReactNode = null
    if (!pickedDefinition) {
        Input = (
            <SelectField
                options={[]}
                isDisabled
                placeholder="Select field value(s)"
                onChange={() => undefined}
                selectedOption={null}
            />
        )
    } else {
        if (isTextInput(pickedDefinition)) {
            Input = (
                <TextInput
                    placeholder="Enter field value"
                    value={
                        value && typeof value[0] === 'string' ? value[0] : ''
                    }
                    onChange={(value) => {
                        onChange([value])
                    }}
                    isDisabled={isDisabled}
                />
            )
        }
        if (isNumberInput(pickedDefinition)) {
            const min = pickedDefinition.definition.input_settings.min
            const max = pickedDefinition.definition.input_settings.max
            Input = (
                <NumberInput
                    value={
                        value && typeof value[0] === 'number'
                            ? value[0]
                            : undefined
                    }
                    onChange={(value) => {
                        onChange(typeof value === 'number' ? [value] : null)
                    }}
                    min={min ? Number(min) : undefined}
                    max={max ? Number(max) : undefined}
                    isDisabled={isDisabled}
                />
            )
        }
        if (isDropdownInput(pickedDefinition)) {
            if (pickedDefinition.definition.data_type === 'boolean') {
                Input = (
                    <SelectField
                        onChange={(option: 'Yes' | 'No') => {
                            onChange(option === 'Yes' ? [true] : [false])
                        }}
                        placeholder="Select field value"
                        options={['Yes', 'No']}
                        isDisabled={isDisabled}
                        selectedOption={
                            value && typeof value[0] === 'boolean'
                                ? value[0]
                                    ? 'Yes'
                                    : 'No'
                                : null
                        }
                    />
                )
            } else {
                Input = (
                    <MultiLevelSelect
                        inputId={`expression-value-${pickedDefinition.id}-${index}`}
                        placeholder="Select field value(s)"
                        choices={
                            pickedDefinition.definition.input_settings
                                .choices || []
                        }
                        allowMultiValues
                        value={value ? value : []}
                        onChange={(values = []) => {
                            onChange(values as string[])
                        }}
                        CustomInput={CustomDropdownInput}
                        customDisplayValue={(value = []) => {
                            if (value.length >= 4) {
                                return `${value.length} fields selected`
                            }
                            return value.map(getShortValueLabel).join(', ')
                        }}
                        dropdownAutoWidth
                        isDisabled={isDisabled}
                    />
                )
            }
        }
    }
    return (
        <>
            {Input}
            {error && <Caption error={error} />}
        </>
    )
})
