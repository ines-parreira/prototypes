import React, {ComponentProps, useEffect, useState} from 'react'

import BooleanField from '../BooleanField'
import InputField, {InputFieldProps} from '../InputField'

import css from './AutoPopulateInput.less'

type Props = Omit<InputProps, 'value' | 'onChange'> & {
    value: string | null
    onChange: (value: string | null) => void
    populateLabel: string
    populateValue: string
} & InputFieldProps<string | null>

type InputProps = ComponentProps<typeof InputField>

const AutoPopulateInput = ({
    value,
    onChange,
    populateLabel,
    populateValue,
    ...inputProps
}: Props): JSX.Element => {
    const [isChecked, setIsChecked] = useState(value === null)
    const [inputValue, setInputValue] = useState(value ?? populateValue)
    const [storedValue, setStoredValue] = useState(value || '')

    const handleCheckboxTick = (isTicked: boolean) => {
        onChange(isTicked ? null : storedValue)
    }

    useEffect(() => {
        setIsChecked(value === null)
        setInputValue(value ?? populateValue)

        if (value !== null) {
            setStoredValue(value)
        }
    }, [value, populateValue])

    return (
        <div className={css.container}>
            <InputField
                {...inputProps}
                value={inputValue}
                onChange={onChange}
                disabled={isChecked}
            />
            <BooleanField
                label={populateLabel}
                value={isChecked}
                onChange={handleCheckboxTick}
            />
        </div>
    )
}

export default AutoPopulateInput
