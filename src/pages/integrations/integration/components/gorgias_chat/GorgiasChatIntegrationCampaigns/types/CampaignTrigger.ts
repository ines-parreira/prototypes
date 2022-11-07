import {CampaignOperator} from './CampaignOperator'
import {CampaignValue} from './CampaignValue'

import {CampaignTriggerKey} from './enums/CampaignTriggerKey.enum'

export interface CampaignTrigger {
    key: CampaignTriggerKey
    value: CampaignValue
    operator: CampaignOperator
}
