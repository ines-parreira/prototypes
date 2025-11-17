import type { ReactNode } from 'react'
import React, { createContext } from 'react'

import type {
    CreateTriggerFn,
    DeleteTriggerFn,
    UpdateTriggerFn,
} from '../../types/AdvancedTriggerBaseProps'
import type { Campaign } from '../../types/Campaign'
import type { CampaignTriggerMap } from '../../types/CampaignTriggerMap'

export interface CampaignDetailsFormApi {
    campaign: Campaign
    triggers: CampaignTriggerMap
    updateCampaign: (key: string, payload: any) => void
    addTrigger: CreateTriggerFn
    updateTrigger: UpdateTriggerFn
    deleteTrigger: DeleteTriggerFn
}

export const CampaignDetailsFormContext = createContext<CampaignDetailsFormApi>(
    {
        campaign: {} as Campaign,
        triggers: {},
        updateCampaign: () => null,
        addTrigger: () => null,
        updateTrigger: () => null,
        deleteTrigger: () => null,
    },
)

export type CampaignDetailsFormProviderType = {
    value: CampaignDetailsFormApi
    children: ReactNode
}

export const CampaignDetailsFormProvider = ({
    value,
    children,
}: CampaignDetailsFormProviderType) => {
    return (
        <CampaignDetailsFormContext.Provider value={value}>
            {children}
        </CampaignDetailsFormContext.Provider>
    )
}
