import React, {useMemo} from 'react'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'
import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'

import {AdvancedTriggerFactory} from '../AdvancedTriggerFactory'

type Props = {
    triggers: CampaignTriggerMap
}

export const AdvancedTriggersForm = ({triggers}: Props): JSX.Element => {
    const formTriggers = useMemo<CampaignTriggerMap>(() => {
        return Object.entries(triggers).reduce((acc, [id, trigger]) => {
            if (
                trigger.key === CampaignTriggerKey.SingleInView ||
                trigger.key === CampaignTriggerKey.DeviceType
            ) {
                return acc
            }
            return {
                ...acc,
                [id]: trigger,
            }
        }, {})
    }, [triggers])

    return (
        <div className="mb-4">
            {Object.entries(formTriggers).map(([id, trigger], index) => (
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
