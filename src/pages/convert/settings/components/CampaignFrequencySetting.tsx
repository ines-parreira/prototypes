import React from 'react'
import classnames from 'classnames'
import {produce} from 'immer'

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
}

export const CampaignFrequencySetting: React.FC<Props> = ({
    campaignFrequencySettings,
    onSettingsChange,
}) => {
    const onMaximumSettingChange = (
        value: MaxCampaignDisplaysInSession | null
    ) => {
        onSettingsChange(
            produce(campaignFrequencySettings ?? {}, (draft) => {
                if (value === null) {
                    delete draft.max_campaign_in_session
                } else {
                    draft.max_campaign_in_session = value
                }
            })
        )
    }
    const onTimeBetweenChange = (value: MinimumTimeBetweenCampaigns | null) => {
        onSettingsChange(
            produce(campaignFrequencySettings ?? {}, (draft) => {
                if (value === null) {
                    delete draft.min_time_between_campaigns
                } else {
                    draft.min_time_between_campaigns = value
                }

                return draft
            })
        )
    }

    return (
        <div className={css.settingSection}>
            <div className={css.headingSection}>
                <span className={'heading-section-semibold'}>
                    Frequency Settings
                </span>
                <span className={'body-regular'}>
                    Set the frequency of campaign displays on your store.
                </span>
            </div>

            <div className={classnames(css.bodySection, css.disabled)}>
                <MaximumCampaignDisplayed
                    config={campaignFrequencySettings?.max_campaign_in_session}
                    onChange={onMaximumSettingChange}
                    label="Maximum campaigns in 24 hours"
                    description="Set the number of campaigns displayed on your store within 24 hours."
                />
            </div>

            <div className={classnames(css.bodySection, css.disabled)}>
                <TimeBetweenCampaigns
                    config={
                        campaignFrequencySettings?.min_time_between_campaigns
                    }
                    onChange={onTimeBetweenChange}
                    label="Minimum time between campaigns"
                    description="Set the time interval between two campaigns displayed on your store."
                />
            </div>
        </div>
    )
}
