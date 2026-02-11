import { useCallback, useState } from 'react'

import classNames from 'classnames'

import { FieldPresentation, MinutesInput } from 'AIJourney/components'
import { POST_PURCHASE_MAX_WAIT_TIME } from 'AIJourney/constants'

import css from './WaitTime.less'

type WaitTimeFieldProps = {
    value?: number
    isDisabled?: boolean
    onChange?: (value?: number) => void
    onValidationChange?: (isValid: boolean) => void
    showError?: boolean
    title?: string
    description?: string
}

export const WaitTimeField = ({
    value,
    isDisabled = false,
    onChange = () => {},
    onValidationChange = () => {},
    showError = false,
    title = 'Wait time before triggering flow',
    description = 'Time in minutes to wait before sending the first message',
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
        (newValue?: number) => {
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
            <FieldPresentation name={title} description={description} />
            <MinutesInput
                value={value}
                max={POST_PURCHASE_MAX_WAIT_TIME}
                onChange={handleChange}
                isDisabled={isDisabled}
                onValidationChange={handleValidationChange}
            />
            {shouldShowError && (
                <div className={css.errorMessage}>
                    Please enter wait time between 0 and{' '}
                    {POST_PURCHASE_MAX_WAIT_TIME} minutes (7 days)
                </div>
            )}
        </div>
    )
}
