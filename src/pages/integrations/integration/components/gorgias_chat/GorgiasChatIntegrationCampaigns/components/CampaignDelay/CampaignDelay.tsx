import React from 'react'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'

import {CAMPAIGN_DELAY} from '../../constants/settings'

import css from './CampaignDelay.less'

type Props = {
    delay?: number
    onChangeDelay: (value: number) => void
}

export const CampaignDelay = ({delay, onChangeDelay}: Props): JSX.Element => {
    const handleChangeDelay = (value: Value) => {
        onChangeDelay(typeof value === 'string' ? parseInt(value, 10) : value)
    }
    return (
        <>
            <div className={css.title}>
                <h5>Delay after the conditions are fulfilled</h5>
                <IconTooltip icon="help_outline" className={css.helpIcon}>
                    Delay displaying the message after all triggers are valid
                </IconTooltip>
            </div>
            <SelectField
                fullWidth
                value={delay}
                options={CAMPAIGN_DELAY}
                onChange={handleChangeDelay}
            />
        </>
    )
}
