import React, {useEffect, useState} from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'

import NumberInput from 'pages/common/forms/input/NumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {MinimumTimeBetweenCampaigns} from 'pages/convert/campaigns/types/CampaignMeta'
import {
    SELECT_OPTIONS,
    DEFAULT_TIME,
    DEFAULT_TIME_UNIT,
    DEFAULT_DESCRIPTION,
    DEFAULT_LABEL,
} from './constants'

import css from './TimeBetweenCampaigns.less'

type Props = {
    config?: MinimumTimeBetweenCampaigns | null
    onChange: (value: MinimumTimeBetweenCampaigns | null) => void
    label?: string
    description?: string
}

export const TimeBetweenCampaigns: React.FC<Props> = ({
    config,
    onChange,
    label,
    description,
}): JSX.Element => {
    const [isEnabled, setEnabled] = useState<boolean>(!!config?.value)
    const [internalValue, setInternalValue] = useState<number>(
        config?.value ?? DEFAULT_TIME
    )
    const [internalUnitValue, setInternalUnitValue] = useState(
        config?.unit ?? DEFAULT_TIME_UNIT
    )

    const handleClickToggle = (nextValue: boolean) => {
        setEnabled(nextValue)

        updateCampaignState(nextValue, internalValue, internalUnitValue)
    }

    const handleChangeValue = (value: number | undefined) => {
        setInternalValue(value as number)
        updateCampaignState(isEnabled, value as number, internalUnitValue)
    }

    const handleChangeUnitValue = (value: any) => {
        setInternalUnitValue(value)
        updateCampaignState(isEnabled, internalValue, value)
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
        setInternalValue(config?.value ?? DEFAULT_TIME)
        setInternalUnitValue(config?.unit ?? DEFAULT_TIME_UNIT)
    }, [config])

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
                        <label
                            htmlFor="time-between-campaigns"
                            className={css.label}
                        >
                            {label ?? DEFAULT_LABEL}
                        </label>
                        <span className={css.labelDescription}>
                            {description ?? DEFAULT_DESCRIPTION}
                        </span>

                        {isEnabled && (
                            <div className={css.settings}>
                                <NumberInput
                                    className={css.numberInput}
                                    value={internalValue}
                                    onChange={handleChangeValue}
                                />
                                <SelectField
                                    value={internalUnitValue}
                                    onChange={handleChangeUnitValue}
                                    options={SELECT_OPTIONS}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default TimeBetweenCampaigns
