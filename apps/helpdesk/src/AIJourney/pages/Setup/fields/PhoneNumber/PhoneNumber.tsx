import { useCallback } from 'react'

import { Dropdown, FieldPresentation } from 'AIJourney/components'
import { NewPhoneNumber } from 'models/phoneNumber/types'

import css from './PhoneNumber.less'

type PhoneNumberFieldProps = {
    options: NewPhoneNumber[]
    value?: NewPhoneNumber
    onChange?: (value: NewPhoneNumber) => void
}

export const PhoneNumberField = ({
    options,
    value,
    onChange = () => {},
}: PhoneNumberFieldProps) => {
    const handleChange = useCallback(
        (value: NewPhoneNumber) => {
            onChange(value)
        },
        [onChange],
    )

    return (
        <div className={css.phoneNumberField}>
            <FieldPresentation
                name="Select your agent’s phone number"
                description="Phone number used for the conversation with the customer"
            />
            <Dropdown options={options} value={value} onChange={handleChange} />
        </div>
    )
}
