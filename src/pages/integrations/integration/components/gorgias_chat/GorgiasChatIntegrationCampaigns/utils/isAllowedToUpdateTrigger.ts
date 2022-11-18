import {CampaignTrigger} from '../types/CampaignTrigger'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'

const betaTriggers = [
    CampaignTriggerKey.BusinessHours,
    CampaignTriggerKey.CartValue,
    CampaignTriggerKey.ExitIntent,
    CampaignTriggerKey.ProductTags,
    CampaignTriggerKey.SessionTime,
    CampaignTriggerKey.SingleInView,
    CampaignTriggerKey.VisitCount,
]

export function isAllowedToUpdateTrigger(
    trigger: CampaignTrigger,
    isRevenueBetaTester = false
): boolean {
    return betaTriggers.includes(trigger.key)
        ? // If the current trigger is one of the advanced one
          // allow it only for beta testers
          isRevenueBetaTester
        : // Otherwise allow it for all merchants
          true
}
