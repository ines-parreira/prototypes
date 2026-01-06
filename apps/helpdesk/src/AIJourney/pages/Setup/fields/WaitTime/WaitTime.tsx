import { useCallback, useState } from 'react'

import classNames from 'classnames'

import { FieldPresentation, MinutesInput } from 'AIJourney/components'

import css from './WaitTime.less'

type WaitTimeFieldProps = {
    value?: number
    isDisabled?: boolean
    onChange?: (value: number) => void
    onValidationChange?: (isValid: boolean) => void
    showError?: boolean
}

export const WaitTimeField = ({
    value,
    isDisabled = false,
    onChange = () => {},
    onValidationChange = () => {},
    showError = false,
}: WaitTimeFieldProps) => {
    const [isValid, setIsValid] = useState(true)
    const [hasInteracted, setHasInteracted] = useState(false)

    const handleValidationChange = useCallback(
        (valid: boolean) => {
            setIsValid(valid)
            onValidationChange(valid)
        },
        [onValidationChange],
    )

    const handleChange = useCallback(
        (newValue: number) => {
            setHasInteracted(true)
            onChange(newValue)
        },
        [onChange],
    )

    const waitTimeFieldClass = classNames(css.waitTimeField, {
        [css['waitTimeField--disabled']]: isDisabled,
        [css['waitTimeField--invalid']]: !isValid,
    })

    const shouldShowError = (showError || hasInteracted) && !isValid

    return (
        <div className={waitTimeFieldClass}>
            <FieldPresentation
                name="Wait time before triggering flow"
                description="Time in minutes to wait before sending the first message"
            />
            <MinutesInput
                value={value}
                onChange={handleChange}
                isDisabled={isDisabled}
                onValidationChange={handleValidationChange}
            />
            {shouldShowError && (
                <div className={css.errorMessage}>
                    Please enter a valid wait time (0 or more minutes)
                </div>
            )}
        </div>
    )
}
