import React from 'react'

import {CampaignCollisionForm} from '../CampaignCollisionForm'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'

type Props = {
    triggers: CampaignTriggerMap
    onChangeCollision: (triggerId: string, value: boolean) => void
}

export const CampaignPreferences = ({triggers, onChangeCollision}: Props) => {
    return (
        <>
            <h5>Campaign preferences</h5>
            <CampaignCollisionForm
                triggers={triggers}
                onChange={onChangeCollision}
            />
        </>
    )
}
