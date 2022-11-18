import {CampaignOperator} from './CampaignOperator'
import {CampaignTrigger} from './CampaignTrigger'
import {CampaignValue} from './CampaignValue'

export type CampaignTriggerPayload = {
    value?: CampaignValue
    operator?: CampaignOperator
}

export type UpdateTriggerFn = (
    triggerId: string,
    payload: CampaignTriggerPayload
) => void

export type DeleteTriggerFn = (triggerId: string) => void

export type AdvancedTriggerBaseProps = {
    id: string
    isAllowedToEdit?: boolean
    trigger: CampaignTrigger
    onUpdateTrigger: UpdateTriggerFn
    onDeleteTrigger: DeleteTriggerFn
}
