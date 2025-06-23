import { useCallback, useEffect } from 'react'

import classNames from 'classnames'

import { FieldPresentation, PercentageInput } from 'AIJourney/components'

import css from './MaximumDiscount.less'

interface MaximumDiscountFieldProps {
    value?: string
    isDisabled?: boolean
    onChange?: (value: string) => void
}

export const MaximumDiscountField = ({
    value,
    isDisabled = false,
    onChange = () => {},
}: MaximumDiscountFieldProps = {}) => {
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
    })

    return (
        <div className={maximumDiscountFieldClass}>
            <FieldPresentation name="Maximum amount" />
            <PercentageInput
                value={value}
                onChange={handleChange}
                isDisabled={isDisabled}
            />
        </div>
    )
}
