import {CampaignTriggerType} from '../types/enums/CampaignTriggerType.enum'
import {TRIGGERS_CONFIG} from '../constants/triggers'
import {CampaignTriggerOperator} from '../types/enums/CampaignTriggerOperator.enum'

export const isTriggerOperatorAllowed = (
    operator: CampaignTriggerOperator,
    triggerType: CampaignTriggerType
): boolean => {
    return !!TRIGGERS_CONFIG[triggerType].operators?.[operator]
}
