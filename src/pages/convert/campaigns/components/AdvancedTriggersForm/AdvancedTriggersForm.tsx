import React, {useMemo, useEffect} from 'react'

import {CampaignTriggerMap} from 'pages/convert/campaigns/types/CampaignTriggerMap'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {useTriggers} from 'pages/convert/campaigns/containers/TriggersProvider'
import {AdvancedTriggerFactory} from 'pages/convert/campaigns/components/AdvancedTriggerFactory'

type Props = {
    triggers: CampaignTriggerMap
    onValidationChange: (isValid: boolean) => void
}

export const AdvancedTriggersForm = ({
    triggers,
    onValidationChange,
}: Props): JSX.Element => {
    const {areTriggersValid} = useTriggers()

    const formTriggers = useMemo<CampaignTriggerMap>(() => {
        return Object.entries(triggers).reduce((acc, [id, trigger]) => {
            if (
                trigger.type === CampaignTriggerType.SingleInView ||
                trigger.type === CampaignTriggerType.DeviceType
            ) {
                return acc
            }
            return {
                ...acc,
                [id]: trigger,
            }
        }, {})
    }, [triggers])

    useEffect(
        () => onValidationChange(areTriggersValid),

        // Update state only if state will change
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [areTriggersValid]
    )

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
