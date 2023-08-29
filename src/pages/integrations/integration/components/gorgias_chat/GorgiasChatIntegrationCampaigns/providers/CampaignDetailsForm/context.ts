import {createContext} from 'react'

import {ChatCampaign} from '../../types/Campaign'
import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'
import {
    CreateTriggerFn,
    DeleteTriggerFn,
    UpdateTriggerFn,
} from '../../types/AdvancedTriggerBaseProps'

export interface CampaignDetailsFormApi {
    campaign: ChatCampaign
    triggers: CampaignTriggerMap
    isEditMode: boolean
    updateCampaign: (key: string, payload: any) => void
    addTrigger: CreateTriggerFn
    updateTrigger: UpdateTriggerFn
    deleteTrigger: DeleteTriggerFn
}

export const CampaignDetailsFormContext = createContext<CampaignDetailsFormApi>(
    {
        campaign: {} as ChatCampaign,
        triggers: {},
        isEditMode: false,
        updateCampaign: () => null,
        addTrigger: () => null,
        updateTrigger: () => null,
        deleteTrigger: () => null,
    }
)
