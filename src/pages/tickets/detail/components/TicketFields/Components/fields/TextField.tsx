import React, {useCallback, useState} from 'react'

import {CustomFieldValue} from 'models/customField/types'
import {OnMutateSettings} from 'models/customField/queries'

import Label from '../Label'
import StealthInput from '../StealthInput'

type Value = string | number | readonly string[]

type Props = {
    label: string
    value?: Value
    placeholder?: string
    isRequired?: boolean
    onChange: (
        value: CustomFieldValue['value'],
        settings: OnMutateSettings
    ) => void
}

export default function TextField({
    label,
    value,
    placeholder,
    onChange,
    isRequired,
}: Props) {
    const initialValue = value?.toString() || ''
    // Almost unnecessary intermediate state here because redux
    //  action/selector flow makes the input laggy otherwise :'(
    const [currentValue, setCurrentValue] = useState(initialValue)
    const handleChange = useCallback((newValue: string) => {
        setCurrentValue(newValue)
    }, [])

    return (
        <Label label={label} isRequired={isRequired}>
            <StealthInput
                name={label}
                type="text"
                value={currentValue}
                placeholder={placeholder}
                onChange={handleChange}
                onBlur={() => {
                    if (currentValue !== initialValue) {
                        onChange(currentValue, {
                            previousValue: initialValue,
                            onError: () => setCurrentValue(initialValue),
                        })
                    }
                }}
            />
        </Label>
    )
}
