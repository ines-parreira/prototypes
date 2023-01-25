import React, {useCallback, useState} from 'react'

import {CustomFieldValue} from 'models/customField/types'

import Label from '../Label'
import StealthInput from '../StealthInput'

type Value = string | number | readonly string[]

type Props = {
    label: string
    value?: Value
    placeholder?: string
    isRequired?: boolean
    onChange: (newValue: CustomFieldValue['value'], leading?: boolean) => void
}

export default function TextField({
    label,
    value,
    placeholder,
    onChange,
    isRequired,
}: Props) {
    // Almost unnecessary intermediate state here because redux
    //  action/selector flow makes the input laggy otherwise :'(
    const [currentValue, setCurrentValue] = useState(value)
    const handleChange = useCallback(
        (newValue: CustomFieldValue['value']) => {
            setCurrentValue(newValue)
            onChange(newValue, false)
        },
        [onChange]
    )

    return (
        <Label label={label} isRequired={isRequired}>
            <StealthInput
                name={label}
                value={currentValue || ''}
                placeholder={placeholder}
                onChange={handleChange}
            />
        </Label>
    )
}
