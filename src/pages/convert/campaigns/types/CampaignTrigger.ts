import { CampaignValue } from './CampaignValue'
import { CampaignTriggerOperator } from './enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from './enums/CampaignTriggerType.enum'

export interface CampaignTrigger {
    id: string
    type: CampaignTriggerType
    operator: CampaignTriggerOperator
    value: CampaignValue
}
