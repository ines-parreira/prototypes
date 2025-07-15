import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'

import { FieldPresentation, PercentageInput } from 'AIJourney/components'

import css from './MaximumDiscount.less'

type MaximumDiscountFieldProps = {
    value?: string
    isDisabled?: boolean
    onChange?: (value: string) => void
    onValidationChange?: (isValid: boolean) => void
}

export const MaximumDiscountField = ({
    value,
    isDisabled = false,
    onChange = () => {},
    onValidationChange = () => {},
}: MaximumDiscountFieldProps = {}) => {
    const [isValid, setIsValid] = useState(true)

    const handleValidationChange = useCallback(
        (valid: boolean) => {
            setIsValid(valid)
            onValidationChange(valid)
        },
        [onValidationChange],
    )

    const handleChange = useCallback(
        (value: string) => {
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
        [css['maximumDiscountField--invalid']]: isValid,
    })

    return (
        <div className={maximumDiscountFieldClass}>
            <FieldPresentation name="Maximum amount" />
            <PercentageInput
                value={value}
                onChange={handleChange}
                isDisabled={isDisabled}
                onValidationChange={handleValidationChange}
            />
        </div>
    )
}
