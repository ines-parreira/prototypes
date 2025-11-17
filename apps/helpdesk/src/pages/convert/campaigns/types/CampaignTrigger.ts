import type { CampaignValue } from './CampaignValue'
import type { CampaignTriggerOperator } from './enums/CampaignTriggerOperator.enum'
import type { CampaignTriggerType } from './enums/CampaignTriggerType.enum'

export interface CampaignTrigger {
    id: string
    type: CampaignTriggerType
    operator: CampaignTriggerOperator
    value: CampaignValue
}
