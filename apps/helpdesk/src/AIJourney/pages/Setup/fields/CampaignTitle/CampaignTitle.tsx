import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'

import { TextField } from '@gorgias/axiom'

import { FieldPresentation } from 'AIJourney/components'

import css from './CampaignTitle.less'

type CampaignTitleFieldProps = {
    value?: string
    isDisabled?: boolean
    onChange?: (value: string) => void
    onValidationChange?: (isValid: boolean) => void
}

export const CampaignTitle = ({
    value,
    isDisabled = false,
    onChange = () => {},
    onValidationChange = () => {},
}: CampaignTitleFieldProps = {}) => {
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

    const handleBlur = useCallback(() => {
        if (!value || value.trim() === '') {
            handleValidationChange(false)
        } else {
            handleValidationChange(true)
        }
    }, [value, handleValidationChange])

    useEffect(() => {
        if (isDisabled && value) {
            handleChange('')
        }
    }, [isDisabled, value, handleChange])

    const campaignTitleFieldClass = classNames(css.campaignTitleField, {
        [css.campaignTitleFieldDisabled]: isDisabled,
    })

    return (
        <div className={campaignTitleFieldClass}>
            <FieldPresentation name="Campaign name" />
            <TextField
                placeholder="Campaign name"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                isDisabled={isDisabled}
                error={isValid ? undefined : 'Campaign name is required.'}
            />
        </div>
    )
}
