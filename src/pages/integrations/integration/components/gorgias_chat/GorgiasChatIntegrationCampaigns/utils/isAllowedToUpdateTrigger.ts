import {BETA_TRIGGERS} from '../constants/triggers'

import {CampaignTrigger} from '../types/CampaignTrigger'

export function isAllowedToUpdateTrigger(
    trigger: CampaignTrigger,
    isConvertSubscriber = false
): boolean {
    return BETA_TRIGGERS.includes(trigger.key)
        ? // If the current trigger is one of the advanced one
          // allow it only for beta testers
          isConvertSubscriber
        : // Otherwise allow it for all merchants
          true
}
