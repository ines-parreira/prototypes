import React, { useCallback, useState } from 'react'

import classnames from 'classnames'
import { produce } from 'immer'

import MaximumCampaignDisplayed from 'pages/convert/campaigns/components/MaximumCampaignDisplayed'
import TimeBetweenCampaigns from 'pages/convert/campaigns/components/TimeBetweenCampaigns'
import {
    CampaignFrequencySettings,
    MaxCampaignDisplaysInSession,
    MinimumTimeBetweenCampaigns,
} from 'pages/convert/settings/types'

import css from './CampaignFrequencySetting.less'

type Props = {
    campaignFrequencySettings?: CampaignFrequencySettings | null
    onSettingsChange: (value: CampaignFrequencySettings) => void
    onValidationChange?: (isValid: boolean) => void
}

export const defaultValidationValues = {
    maximumCampaignsDisplayed: {
        defaultValue: 8,
        minValue: 3,
        maxValue: 30,
    },
    timeBetweenCampaigns: {
        defaultValue: 30,
        minValue: 5,
        maxValue: 3 * 60,
    },
}

export const CampaignFrequencySetting: React.FC<Props> = ({
    campaignFrequencySettings,
    onSettingsChange,
    onValidationChange,
}) => {
    const [, setValidationState] = useState({})
    const onFrequentValidationChange = useCallback(
        (field: string) => (isValid: boolean) => {
            setValidationState((prevState) => {
                const newValidationState = {
                    ...prevState,
                    [field]: isValid,
                }

                onValidationChange?.(
                    Object.values(newValidationState).every(Boolean),
                )

                return newValidationState
            })
        },
        [onValidationChange],
    )
    const onMaximumSettingChange = (
        value: MaxCampaignDisplaysInSession | null,
    ) => {
        onSettingsChange(
            produce(campaignFrequencySettings ?? {}, (draft) => {
                draft.max_campaign_in_session = value
            }),
        )
    }
    const onTimeBetweenChange = (value: MinimumTimeBetweenCampaigns | null) => {
        onSettingsChange(
            produce(campaignFrequencySettings ?? {}, (draft) => {
                draft.min_time_between_campaigns = value
            }),
        )
    }

    return (
        <div className={css.settingSection}>
            <div className={css.headingSection}>
                <span className={'heading-section-semibold'}>
                    Frequency Settings
                </span>
                <span className={'body-regular'}>
                    Choose how frequently shoppers see campaigns on your store.
                </span>
            </div>

            <div className={classnames(css.bodySection, css.disabled)}>
                <MaximumCampaignDisplayed
                    config={campaignFrequencySettings?.max_campaign_in_session}
                    onChange={onMaximumSettingChange}
                    description="Limit the number of times a shopper can see campaigns on your store within 24 hours."
                    onValidationChange={onFrequentValidationChange(
                        'max_campaign_in_session',
                    )}
                    {...defaultValidationValues.maximumCampaignsDisplayed}
                />
            </div>

            <div className={classnames(css.bodySection, css.disabled)}>
                <TimeBetweenCampaigns
                    config={
                        campaignFrequencySettings?.min_time_between_campaigns
                    }
                    onChange={onTimeBetweenChange}
                    label="Time required between campaigns​"
                    description="Set a minimum time between campaigns being shown to shoppers on your store."
                    tooltip="Campaigns with Exit Intent conditions are exempt from this setting. They are shown to shoppers at the exact time when their conditions are met."
                    onValidationChange={onFrequentValidationChange(
                        'time_between_campaigns',
                    )}
                    {...defaultValidationValues.timeBetweenCampaigns}
                />
            </div>
        </div>
    )
}
