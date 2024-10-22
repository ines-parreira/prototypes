import React from 'react'
import {Link} from 'react-router-dom'
import {Tooltip} from '@gorgias/ui-kit'

import MaximumCampaignDisplayed from 'pages/convert/campaigns/components/MaximumCampaignDisplayed'
import TimeBetweenCampaigns from 'pages/convert/campaigns/components/TimeBetweenCampaigns'

import {
    CampaignDisplaysInSession,
    MinimumTimeBetweenCampaigns,
} from 'pages/convert/campaigns/types/CampaignMeta'

import css from './CampaignFrequency.less'

type Props = {
    integrationId: string
    maximumCampaignsDisplayed?: CampaignDisplaysInSession | null
    timeBetweenCampaigns?: MinimumTimeBetweenCampaigns | null
    onChangeMaximumCampaignDisplayed: (
        value: CampaignDisplaysInSession | null
    ) => void
    onChangeTimeBetweenCampaigns: (
        value: MinimumTimeBetweenCampaigns | null
    ) => void
    onValidationChange?: (isValid: boolean) => void
}

const defaultValidationValues = {
    maximumCampaignsDisplayed: {
        defaultValue: 8,
        minValue: 1,
        maxValue: 15,
    },
    timeBetweenCampaigns: {
        defaultValue: 30,
        minValue: 5, // 5 seconds
        maxValue: 60 * 60, // 3600 seconds / 60 minutes
    },
}

const CampaignFrequency: React.FC<Props> = ({
    integrationId,
    maximumCampaignsDisplayed,
    onChangeMaximumCampaignDisplayed,
    timeBetweenCampaigns,
    onChangeTimeBetweenCampaigns,
    onValidationChange,
}) => {
    return (
        <>
            <div className={css.title}>
                <h5>Frequency settings</h5>
                <span id="frequency-tooltip" className={css.helpIcon}>
                    <i className="material-icons-outlined">info</i>
                </span>
                <Tooltip
                    target="frequency-tooltip"
                    autohide={false}
                    className={css.helpIcon}
                >
                    Setting how often this campaign is shown to a customer in a
                    session will override your account settings{' '}
                    <Link to={`/app/convert/${integrationId}/settings`}>
                        here
                    </Link>
                    .
                </Tooltip>
            </div>
            <div className={css.settings}>
                <MaximumCampaignDisplayed
                    config={maximumCampaignsDisplayed}
                    onChange={onChangeMaximumCampaignDisplayed}
                    onValidationChange={onValidationChange}
                    {...defaultValidationValues.maximumCampaignsDisplayed}
                />
                <TimeBetweenCampaigns
                    config={timeBetweenCampaigns}
                    onChange={onChangeTimeBetweenCampaigns}
                    onValidationChange={onValidationChange}
                    {...defaultValidationValues.timeBetweenCampaigns}
                />
            </div>
        </>
    )
}

export default CampaignFrequency
