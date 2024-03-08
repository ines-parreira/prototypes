import {CampaignValue} from './CampaignValue'

import {CampaignTriggerType} from './enums/CampaignTriggerType.enum'
import {CampaignTriggerOperator} from './enums/CampaignTriggerOperator.enum'

export interface CampaignTrigger {
    id: string
    type: CampaignTriggerType
    operator: CampaignTriggerOperator
    value: CampaignValue
}
