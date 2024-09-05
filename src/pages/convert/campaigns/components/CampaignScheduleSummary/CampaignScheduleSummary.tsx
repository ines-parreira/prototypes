import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'

import css from './CampaignScheduleSummary.less'

const CampaignScheduleSummary = () => {
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)

    return (
        <div className={css.messageWrapper}>
            Your campaign will run from{' '}
            <strong>Monday, 2 September 2024,</strong> <strong>all day</strong>,{' '}
            {businessHoursSettings?.data?.timezone} time.
        </div>
    )
}

export default CampaignScheduleSummary
