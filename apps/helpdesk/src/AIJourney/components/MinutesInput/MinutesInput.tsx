import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import classNames from 'classnames'

import css from './MinutesInput.less'

type MinutesInputProps = {
    value?: number
    isDisabled?: boolean
    max?: number
    onChange?: (value: number) => void
    onValidationChange?: (isValid: boolean) => void
}

export const MinutesInput = ({
    value,
    max,
    isDisabled = false,
    onChange = () => {},
    onValidationChange = () => {},
}: MinutesInputProps) => {
    const [isValid, setIsValid] = useState(true)

    useEffect(() => {
        if (isDisabled) {
            setIsValid(true)
            onValidationChange(true)
        }
    }, [isDisabled, onValidationChange])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        const newValue = input.valueAsNumber

        if (Number.isNaN(newValue)) {
            onChange(0)
            setIsValid(false)
            onValidationChange(false)
            return
        }

        onChange(newValue)

        const validity = input.validity.valid
        setIsValid(validity)
        onValidationChange(validity)
    }

    const inputClass = classNames(css.minutesInput, {
        [css['minutesInput--invalid']]: !isValid,
    })

    return (
        <div className={css.minutesInputContainer}>
            <input
                className={inputClass}
                type="number"
                min={0}
                max={max}
                step={1}
                value={value}
                onChange={handleChange}
                disabled={isDisabled}
            />
            <div className={css.minutesDecorator}>min</div>
        </div>
    )
}
