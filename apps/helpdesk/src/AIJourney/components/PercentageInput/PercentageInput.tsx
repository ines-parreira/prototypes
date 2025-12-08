import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import classNames from 'classnames'

import css from './PercentageInput.less'

type PercentageInputProps = {
    value?: string
    isDisabled?: boolean
    onChange?: (value: string) => void
    onValidationChange?: (isValid: boolean) => void
}

export const PercentageInput = ({
    value,
    isDisabled = false,
    onChange = () => {},
    onValidationChange = () => {},
}: PercentageInputProps) => {
    const [isValid, setIsValid] = useState(true)

    useEffect(() => {
        if (isDisabled) {
            setIsValid(true)
            onValidationChange(true)
        }
    }, [isDisabled, onValidationChange])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        const newValue = input.value

        if (newValue.length > 3) return

        onChange(newValue)

        const validity = input.validity.valid
        setIsValid(validity)
        onValidationChange(validity)
    }

    const handleOnBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        let newValue = input.value

        newValue = newValue.replace(/^0+(?=\d)/, '')

        if (newValue !== input.value) {
            onChange(newValue)
        }
    }

    const inputClass = classNames(css.percentageInput, {
        [css['percentageInput--invalid']]: !isValid,
    })

    return (
        <div className={css.percentageInputContainer}>
            <input
                className={inputClass}
                type="number"
                maxLength={3}
                max={100}
                min={1}
                value={value}
                onChange={handleChange}
                onBlur={handleOnBlur}
                disabled={isDisabled}
                required
            />
            <div className={css.percentageDecorator}>%</div>
        </div>
    )
}
