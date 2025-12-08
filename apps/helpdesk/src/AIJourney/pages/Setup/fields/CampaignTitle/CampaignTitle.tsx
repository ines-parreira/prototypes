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
    showError?: boolean
}

export const CampaignTitle = ({
    value,
    isDisabled = false,
    onChange = () => {},
    onValidationChange = () => {},
    showError = false,
}: CampaignTitleFieldProps = {}) => {
    const [hasInteracted, setHasInteracted] = useState(false)

    const isValid = !!(value && value.trim() !== '')

    const handleChange = useCallback(
        (newValue: string) => {
            onChange(newValue)
            onValidationChange(!!(newValue && newValue.trim() !== ''))
        },
        [onChange, onValidationChange],
    )

    const handleBlur = useCallback(() => {
        setHasInteracted(true)
    }, [])

    useEffect(() => {
        if (isDisabled && value) {
            onChange('')
        }
    }, [isDisabled, value, onChange])

    const campaignTitleFieldClass = classNames(css.campaignTitleField, {
        [css.campaignTitleFieldDisabled]: isDisabled,
    })

    const shouldShowError = (showError || hasInteracted) && !isValid

    return (
        <div className={campaignTitleFieldClass}>
            <FieldPresentation name="Campaign name" required />
            <TextField
                placeholder="Campaign name"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                isDisabled={isDisabled}
                error={
                    shouldShowError ? 'Campaign name is required.' : undefined
                }
            />
        </div>
    )
}
