import React from 'react'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'

import {AdvancedTriggerFactory} from '../AdvancedTriggerFactory'

type Props = {
    triggers: CampaignTriggerMap
}

export const AdvancedTriggersForm = ({triggers}: Props): JSX.Element => {
    return (
        <div className="mb-4">
            {Object.entries(triggers).map(([id, trigger], index) => (
                <AdvancedTriggerFactory
                    key={id}
                    id={id}
                    isFirst={index === 0}
                    trigger={trigger}
                />
            ))}
        </div>
    )
}
