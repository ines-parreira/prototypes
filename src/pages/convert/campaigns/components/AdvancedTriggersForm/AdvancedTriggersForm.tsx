import React, {useMemo, useEffect} from 'react'

import {AdvancedTriggerFactory} from 'pages/convert/campaigns/components/AdvancedTriggerFactory'
import {useTriggers} from 'pages/convert/campaigns/containers/TriggersProvider'
import {CampaignTriggerMap} from 'pages/convert/campaigns/types/CampaignTriggerMap'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'

type Props = {
    triggers: CampaignTriggerMap
    onValidationChange: (isValid: boolean) => void
}

// We will still have `single_in_view` triggers in database , so it is important to
// filter them out and not display them
const excludeTriggers = [
    CampaignTriggerType.SingleInView,
    CampaignTriggerType.DeviceType,
    CampaignTriggerType.IncognitoVisitor,
]

export const AdvancedTriggersForm = ({
    triggers,
    onValidationChange,
}: Props): JSX.Element => {
    const {areTriggersValid} = useTriggers()

    const formTriggers = useMemo<CampaignTriggerMap>(() => {
        return Object.entries(triggers).reduce((acc, [id, trigger]) => {
            if (excludeTriggers.includes(trigger.type)) {
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
