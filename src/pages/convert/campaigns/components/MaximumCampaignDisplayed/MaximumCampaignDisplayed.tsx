import React, {useEffect, useState} from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'
import NumberInput from 'pages/common/forms/input/NumberInput'
import InputField from 'pages/common/forms/input/InputField'
import {CampaignDisplaysInSession} from 'pages/convert/campaigns/types/CampaignMeta'
import css from './MaximumCampaignDisplayed.less'

const DEFAULT_MAX_CAMPAIGN_DISPLAYED = 3

type Props = {
    config: CampaignDisplaysInSession | null | undefined
    onChange: (newValue: CampaignDisplaysInSession | null) => void
}

export const MaximumCampaignDisplayed = ({
    config,
    onChange,
}: Props): JSX.Element => {
    const [isEnabled, setEnabled] = useState<boolean>(!!config?.value)
    const [internalValue, setInternalValue] = useState<number>(
        config?.value ?? DEFAULT_MAX_CAMPAIGN_DISPLAYED
    )

    const handleClickToggle = (nextValue: boolean) => {
        setEnabled(nextValue)

        updateCampaignState(nextValue, internalValue)
    }

    const handleChangeValue = (value: number | undefined) => {
        setInternalValue(value as number)
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
        setInternalValue(config?.value ?? DEFAULT_MAX_CAMPAIGN_DISPLAYED)
    }, [config])

    return (
        <>
            <div className={css.container}>
                <div className={css.inputContainer}>
                    <ToggleInput
                        id="maximum-displayed-campaigns"
                        isToggled={isEnabled}
                        aria-label="Maximum campaign display in a session"
                        onClick={handleClickToggle}
                    />
                    <div>
                        <label
                            htmlFor="maximum-displayed-campaigns"
                            className={css.label}
                        >
                            Maximum campaign display in a session
                        </label>
                        <span className={css.labelDescription}>
                            Set how often this campaign is displayed to a
                            customer in a session.
                        </span>
                        {isEnabled && (
                            <div className={css.settings}>
                                <NumberInput
                                    className={css.numberInput}
                                    value={internalValue}
                                    defaultValue={
                                        DEFAULT_MAX_CAMPAIGN_DISPLAYED
                                    }
                                    onChange={handleChangeValue}
                                    min={3}
                                    max={30}
                                />
                                <InputField
                                    value={'in 24 hours'}
                                    className={css.disableInput}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default MaximumCampaignDisplayed
