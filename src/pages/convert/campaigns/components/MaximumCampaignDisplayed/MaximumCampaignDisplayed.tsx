import React, {useEffect, useState} from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'
import NumberInput from 'pages/common/forms/input/NumberInput'
import InputField from 'pages/common/forms/input/InputField'
import {CampaignDisplaysInSession} from 'pages/convert/campaigns/types/CampaignMeta'
import css from './MaximumCampaignDisplayed.less'

const DEFAULT_LABEL = 'Maximum campaign display in a session'
const DEFAULT_DESCRIPTION =
    'Set how often this campaign is displayed to a customer in a session.'

type Props = {
    config: CampaignDisplaysInSession | null | undefined
    onChange: (newValue: CampaignDisplaysInSession | null) => void
    label?: string
    description?: string
    defaultValue?: number
    minValue: number
    maxValue: number
    onValidationChange?: (isValid: boolean) => void
}

export const MaximumCampaignDisplayed = ({
    config,
    onChange,
    label,
    description,
    defaultValue,
    minValue,
    maxValue,
    onValidationChange,
}: Props): JSX.Element => {
    const [isEnabled, setEnabled] = useState<boolean>(!!config?.value)
    const [internalValue, setInternalValue] = useState<number>(
        config?.value ?? (defaultValue as number)
    )

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Validate the value and set the error message if necessary
    const validateAndSetErrorMessage = (value: number | undefined): boolean => {
        if (value === undefined) {
            return false
        }

        if (value < minValue || value > maxValue) {
            setErrorMessage(
                `Value should be between ${minValue} and ${maxValue}.`
            )
            return false
        }

        setErrorMessage(null)
        return true
    }

    const handleClickToggle = (nextValue: boolean) => {
        setEnabled(nextValue)

        updateCampaignState(nextValue, internalValue)
    }

    const handleChangeValue = (value: number | undefined) => {
        setInternalValue(value as number)

        const isValid = validateAndSetErrorMessage(value)

        onValidationChange?.(isValid)

        if (!isValid) {
            return
        }

        updateCampaignState(isEnabled, value as number)
    }

    const updateCampaignState = (
        isEnabled: boolean,
        value: number | undefined
    ) => {
        onChange(
            isEnabled && value
                ? {
                      value: value,
                  }
                : null
        )
    }

    useEffect(() => {
        setEnabled(!!config?.value)
        setInternalValue(config?.value ?? (defaultValue as number))
    }, [config, defaultValue])

    return (
        <>
            <div className={css.container}>
                <div className={css.inputContainer}>
                    <ToggleInput
                        id="maximum-displayed-campaigns"
                        isToggled={isEnabled}
                        aria-label={label ?? DEFAULT_LABEL}
                        onClick={handleClickToggle}
                    />
                    <div>
                        <label
                            htmlFor="maximum-displayed-campaigns"
                            className={css.label}
                        >
                            {label ?? DEFAULT_LABEL}
                        </label>
                        <span className={css.labelDescription}>
                            {description ?? DEFAULT_DESCRIPTION}
                        </span>
                        {isEnabled && (
                            <>
                                <div className={css.settings}>
                                    <NumberInput
                                        className={css.numberInput}
                                        value={internalValue}
                                        onChange={handleChangeValue}
                                        min={minValue}
                                        max={maxValue}
                                    />
                                    <InputField
                                        value={'in 24 hours'}
                                        className={css.disableInput}
                                    />
                                </div>
                                {errorMessage && (
                                    <div className={css.error}>
                                        {errorMessage}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default MaximumCampaignDisplayed
