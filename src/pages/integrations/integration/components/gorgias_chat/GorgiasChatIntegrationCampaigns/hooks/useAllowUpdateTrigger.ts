import {CampaignTrigger} from '../types/CampaignTrigger'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'

import {useIsRevenueBetaTester} from './useIsRevenueBetaTester'

const betaTriggers = [
    CampaignTriggerKey.BusinessHours,
    CampaignTriggerKey.CartValue,
    CampaignTriggerKey.ExitIntent,
    CampaignTriggerKey.ProductTags,
    CampaignTriggerKey.SessionTime,
    CampaignTriggerKey.SingleInView,
    CampaignTriggerKey.VisitCount,
]

export function useAllowUpdateTrigger(trigger: CampaignTrigger): boolean {
    const isRevenueBetaTester: boolean = useIsRevenueBetaTester()

    return betaTriggers.includes(trigger.key)
        ? // If the current trigger is one of the advanced one
          // allow it only for beta testers
          isRevenueBetaTester
        : // Otherwise allow it for all merchants
          true
}
