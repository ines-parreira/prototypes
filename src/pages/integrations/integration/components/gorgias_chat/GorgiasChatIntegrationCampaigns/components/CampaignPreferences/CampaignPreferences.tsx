import React from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

import {CampaignCollisionForm} from '../CampaignCollisionForm'
import {CampaignWithNoReply} from '../CampaignWithNoReply'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'

import css from './CampaignPreferences.less'

type Props = {
    isNoReply: boolean
    triggers: CampaignTriggerMap
    onChangeCollision: (triggerId: string, value: boolean) => void
    onChangeNoReply: (value: boolean) => void
}

export const CampaignPreferences = ({
    isNoReply,
    triggers,
    onChangeCollision,
    onChangeNoReply,
}: Props) => {
    const allowNoReply = useFlags()[FeatureFlagKey.CampaignWithNoReply]

    return (
        <>
            <h5>Campaign preferences</h5>
            <div className={css.items}>
                {allowNoReply && (
                    <CampaignWithNoReply
                        value={isNoReply}
                        onChange={onChangeNoReply}
                    />
                )}
                <CampaignCollisionForm
                    triggers={triggers}
                    onChange={onChangeCollision}
                />
            </div>
        </>
    )
}
