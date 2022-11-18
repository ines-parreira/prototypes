import React, {useMemo} from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {isAllowedToUpdateTrigger} from '../../utils/isAllowedToUpdateTrigger'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'
import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'

import {AdvancedTriggerFactory} from '../AdvancedTriggerFactory'

type Props = {
    isRevenueBetaTester: boolean
    triggers: CampaignTriggerMap
}

export const AdvancedTriggersForm = ({
    isRevenueBetaTester,
    triggers,
}: Props): JSX.Element => {
    const formTriggers = useMemo<CampaignTriggerMap>(() => {
        return Object.entries(triggers).reduce((acc, [id, trigger]) => {
            if (trigger.key === CampaignTriggerKey.SingleInView) {
                return acc
            }
            return {
                ...acc,
                [id]: trigger,
            }
        }, {})
    }, [triggers])

    const shouldShowContactCsm = Object.values(triggers).some(
        (trigger) => !isAllowedToUpdateTrigger(trigger, isRevenueBetaTester)
    )

    return (
        <>
            <div className="mb-4">
                {shouldShowContactCsm && (
                    <Alert icon type={AlertType.Warning}>
                        The advanced triggers are available for{' '}
                        <strong>Revenue subscribers</strong>. If you want to
                        update them, please{' '}
                        <strong>contact your Customer Success Manager</strong>!
                    </Alert>
                )}
            </div>
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
        </>
    )
}
