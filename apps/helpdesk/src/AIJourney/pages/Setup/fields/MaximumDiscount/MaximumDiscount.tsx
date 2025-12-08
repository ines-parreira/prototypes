import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'

import { FieldPresentation, PercentageInput } from 'AIJourney/components'

import css from './MaximumDiscount.less'

type MaximumDiscountFieldProps = {
    value?: string
    isDisabled?: boolean
    onChange?: (value: string) => void
    onValidationChange?: (isValid: boolean) => void
    showError?: boolean
}

export const MaximumDiscountField = ({
    value,
    isDisabled = false,
    onChange = () => {},
    onValidationChange = () => {},
    showError = false,
}: MaximumDiscountFieldProps = {}) => {
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
        (value: string) => {
            setHasInteracted(true)
            onChange(value)
        },
        [onChange],
    )

    useEffect(() => {
        if (isDisabled && value) {
            handleChange('')
        }
    }, [isDisabled, value, handleChange])

    const maximumDiscountFieldClass = classNames(css.maximumDiscountField, {
        [css['maximumDiscountField--disabled']]: isDisabled,
        [css['maximumDiscountField--invalid']]: !isValid,
    })

    const shouldShowError = (showError || hasInteracted) && !isValid

    return (
        <div className={maximumDiscountFieldClass}>
            <FieldPresentation name="Discount code value" required />
            <PercentageInput
                value={value}
                onChange={handleChange}
                isDisabled={isDisabled}
                onValidationChange={handleValidationChange}
            />
            {shouldShowError && (
                <div className={css.errorMessage}>
                    Discount code value is required.
                </div>
            )}
        </div>
    )
}
