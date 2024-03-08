import {CampaignTrigger} from './CampaignTrigger'
import {CampaignTriggerType} from './enums/CampaignTriggerType.enum'

export type CreateTriggerFn = (
    type: CampaignTriggerType,
    payload?: CampaignTrigger
) => void

export type UpdateTriggerFn = (
    triggerId: string,
    payload: CampaignTrigger
) => void

export type DeleteTriggerFn = (triggerId: string) => void

export type AdvancedTriggerBaseProps = {
    id: string
    isAllowedToEdit?: boolean
    trigger: CampaignTrigger
    onUpdateTrigger: UpdateTriggerFn
    onDeleteTrigger: DeleteTriggerFn
}
