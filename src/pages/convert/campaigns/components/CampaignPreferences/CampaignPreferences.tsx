import React from 'react'

import {CampaignWithNoReply} from '../CampaignWithNoReply'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'

import css from './CampaignPreferences.less'

type Props = {
    isNoReply: boolean
    triggers: CampaignTriggerMap
    onChangeNoReply: (value: boolean) => void
}

export const CampaignPreferences = ({isNoReply, onChangeNoReply}: Props) => {
    return (
        <>
            <h5>Campaign preferences</h5>
            <div className={css.items}>
                <CampaignWithNoReply
                    value={isNoReply}
                    onChange={onChangeNoReply}
                />
            </div>
        </>
    )
}
