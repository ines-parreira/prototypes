import { useCallback } from 'react'

import { Dropdown, FieldPresentation } from 'AIJourney/components'

import css from './PhoneNumber.less'

type PhoneNumberFieldProps = {
    options?: string[]
    value?: string
    onChange?: (value: string) => void
}

export const PhoneNumberField = ({
    options,
    value,
    onChange = () => {},
}: PhoneNumberFieldProps) => {
    const handleChange = useCallback(
        (value: string) => {
            onChange(value)
        },
        [onChange],
    )

    return (
        <div className={css.phoneNumberField}>
            <FieldPresentation
                name="Phone number"
                description="Phone number used for the conversation"
            />
            <Dropdown options={options} value={value} onChange={handleChange} />
        </div>
    )
}
