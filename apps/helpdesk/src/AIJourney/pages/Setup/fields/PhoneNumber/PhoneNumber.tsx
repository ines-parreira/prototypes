import { useCallback, useState } from 'react'

import { Dropdown, FieldPresentation } from 'AIJourney/components'
import type { NewPhoneNumber } from 'models/phoneNumber/types'

import css from './PhoneNumber.less'

type PhoneNumberFieldProps = {
    options: NewPhoneNumber[]
    value?: NewPhoneNumber
    onChange?: (value: NewPhoneNumber) => void
    onValidationChange?: (isValid: boolean) => void
    showError?: boolean
}

export const PhoneNumberField = ({
    options,
    value,
    onChange = () => {},
    onValidationChange = () => {},
    showError = false,
}: PhoneNumberFieldProps) => {
    const [hasInteracted, setHasInteracted] = useState(false)

    const handleChange = useCallback(
        (value: NewPhoneNumber) => {
            setHasInteracted(true)
            onChange(value)
            onValidationChange(!!value)
        },
        [onChange, onValidationChange],
    )

    const shouldShowError = (showError || hasInteracted) && !value

    return (
        <div className={css.phoneNumberField}>
            <FieldPresentation
                name="Select your agent's phone number"
                description="Phone number used for the conversation with the customer"
                required
            />
            <Dropdown options={options} value={value} onChange={handleChange} />
            {shouldShowError && (
                <div className={css.errorMessage}>
                    Agent&apos;s phone number is required.
                </div>
            )}
        </div>
    )
}
