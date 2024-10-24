import moment from 'moment'
import React, {useEffect, useState} from 'react'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import NumberInput from 'pages/common/forms/input/NumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'

import {MinimumTimeBetweenCampaigns} from 'pages/convert/campaigns/types/CampaignMeta'

import {
    SELECT_OPTIONS,
    DEFAULT_TIME,
    DEFAULT_TIME_UNIT,
    DEFAULT_DESCRIPTION,
    DEFAULT_LABEL,
    MINUTES_UNITS,
    SECONDS_UNITS,
} from './constants'

import css from './TimeBetweenCampaigns.less'

type Props = {
    config?: MinimumTimeBetweenCampaigns | null
    label?: string
    description?: string
    defaultValue?: number
    minValue: number
    maxValue: number // The maximum value should be defined as seconds
    onChange: (value: MinimumTimeBetweenCampaigns | null) => void
    onValidationChange?: (isValid: boolean) => void
    tooltip?: string
}

export const TimeBetweenCampaigns: React.FC<Props> = ({
    config,
    onChange,
    label,
    description,
    defaultValue = DEFAULT_TIME,
    minValue,
    maxValue,
    onValidationChange,
    tooltip,
}): JSX.Element => {
    const [isEnabled, setEnabled] = useState<boolean>(!!config?.value)
    const [internalValue, setInternalValue] = useState<number | undefined>(
        config?.value ?? defaultValue
    )
    const [internalUnitValue, setInternalUnitValue] = useState(
        config?.unit ?? DEFAULT_TIME_UNIT
    )

    const [min, setMin] = useState(minValue)
    const [max, setMax] = useState(maxValue)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleClickToggle = (nextValue: boolean) => {
        setEnabled(nextValue)
        updateCampaignState(nextValue, internalValue, internalUnitValue)
    }

    const handleChangeValue = (value?: number) => {
        setInternalValue(value)

        const isValid = validateAndSetErrorMessage(
            value,
            min,
            max,
            internalUnitValue
        )

        onValidationChange?.(isValid)

        if (!isValid) {
            return
        }

        updateCampaignState(isEnabled, value, internalUnitValue)
    }

    const convertValue = (value: number, unit: string): number => {
        const isMinutes = unit === MINUTES_UNITS

        return isMinutes
            ? Math.max(1, moment.duration(value, SECONDS_UNITS).asMinutes())
            : moment.duration(value, MINUTES_UNITS).asSeconds()
    }

    const setNewMinMaxValue = (newUnitValue: any) => {
        const isMinutes = newUnitValue === MINUTES_UNITS

        const newMin = isMinutes
            ? Math.max(1, moment.duration(minValue, SECONDS_UNITS).asMinutes())
            : minValue

        const newMax = isMinutes
            ? moment.duration(maxValue, SECONDS_UNITS).asMinutes()
            : maxValue

        setMin(newMin)
        setMax(newMax)

        return [newMin, newMax]
    }

    const handleChangeUnitValue = (newUnitValue: any) => {
        // internalValue can be undefined, so we need to handle this case to avoid potential errors.
        // This involves checking if internalValue is undefined and providing a default value or handling it appropriately.
        const newInternalValue = convertValue(internalValue ?? 0, newUnitValue)
        const [newMin, newMax] = setNewMinMaxValue(newUnitValue)
        setInternalValue(newInternalValue)
        setInternalUnitValue(newUnitValue)

        // Validate on unit change
        const isValid = validateAndSetErrorMessage(
            newInternalValue,
            newMin,
            newMax,
            newUnitValue
        )

        onValidationChange?.(isValid)

        if (!isValid) {
            return
        }

        updateCampaignState(isEnabled, newInternalValue, newUnitValue)
    }

    // Validate the value and set the error message if necessary
    const validateAndSetErrorMessage = (
        value: number | undefined,
        minValue: number,
        maxValue: number,
        unit: string
    ): boolean => {
        if (value === undefined) {
            return false
        }

        if (value < minValue || value > maxValue) {
            setErrorMessage(
                `Value should be between ${min} and ${max} ${
                    unit === MINUTES_UNITS ? 'minutes' : 'seconds'
                }`
            )
            return false
        }

        setErrorMessage(null)
        return true
    }

    const updateCampaignState = (
        isEnabled: boolean,
        value: number | undefined,
        unit: string
    ) => {
        onChange(
            isEnabled && value
                ? ({
                      value: value,
                      unit: unit,
                  } as MinimumTimeBetweenCampaigns)
                : null
        )
    }

    useEffect(() => {
        setEnabled(!!config?.value)
        setInternalValue(config?.value ?? defaultValue)
        setInternalUnitValue(config?.unit ?? DEFAULT_TIME_UNIT)

        // Update min and max values when the component is mounted
        setNewMinMaxValue(config?.unit ?? DEFAULT_TIME_UNIT)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, defaultValue])

    return (
        <>
            <div className={css.container}>
                <div className={css.inputContainer}>
                    <ToggleInput
                        id="time-between-campaigns"
                        isToggled={isEnabled}
                        aria-label={label ?? DEFAULT_LABEL}
                        onClick={handleClickToggle}
                    />
                    <div>
                        <div className={css.labelWrapper}>
                            <label
                                htmlFor="time-between-campaigns"
                                className={css.label}
                            >
                                {label ?? DEFAULT_LABEL}
                            </label>
                            {tooltip && (
                                <IconTooltip
                                    icon="info"
                                    className={css.helpIcon}
                                    tooltipProps={{
                                        placement: 'top-start',
                                    }}
                                >
                                    {tooltip}
                                </IconTooltip>
                            )}
                        </div>
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
                                        onFocus={() => setErrorMessage(null)}
                                        min={min}
                                        max={max}
                                    />
                                    <SelectField
                                        value={internalUnitValue}
                                        onChange={handleChangeUnitValue}
                                        options={SELECT_OPTIONS}
                                        className={css.selectUnit}
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

export default TimeBetweenCampaigns
