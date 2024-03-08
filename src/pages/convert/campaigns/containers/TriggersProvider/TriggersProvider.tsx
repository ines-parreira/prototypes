import React, {ReactNode} from 'react'
import {
    DeleteTriggerFn,
    UpdateTriggerFn,
} from '../../types/AdvancedTriggerBaseProps'

import {CampaignTrigger} from '../../types/CampaignTrigger'

import TriggersContext from './context'

type Props = {
    children: ReactNode
    triggers: Record<string, CampaignTrigger>
    onUpdateTrigger: UpdateTriggerFn
    onDeleteTrigger: DeleteTriggerFn
}

export const TriggersProvider = ({
    children,
    triggers,
    onUpdateTrigger,
    onDeleteTrigger,
}: Props): JSX.Element => {
    return (
        <TriggersContext.Provider
            value={{triggers, onUpdateTrigger, onDeleteTrigger}}
        >
            {children}
        </TriggersContext.Provider>
    )
}
