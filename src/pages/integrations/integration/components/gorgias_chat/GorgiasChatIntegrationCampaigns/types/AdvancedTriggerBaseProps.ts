import {CampaignOperator} from './CampaignOperator'
import {CampaignTrigger} from './CampaignTrigger'
import {CampaignValue} from './CampaignValue'
import {CampaignTriggerKey} from './enums/CampaignTriggerKey.enum'

export type CampaignTriggerPayload = {
    value?: CampaignValue
    operator?: CampaignOperator
}

export type CreateTriggerFn = (
    key: CampaignTriggerKey,
    payload?: CampaignTrigger
) => void

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
