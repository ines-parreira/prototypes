import { CONVERT_LIGHT_TRIGGERS } from '../constants/triggers'
import { CampaignTrigger } from '../types/CampaignTrigger'

export function isAllowedToUpdateTrigger(
    trigger: CampaignTrigger,
    isConvertSubscriber = false,
): boolean {
    return isConvertSubscriber || CONVERT_LIGHT_TRIGGERS.includes(trigger.type)
}
