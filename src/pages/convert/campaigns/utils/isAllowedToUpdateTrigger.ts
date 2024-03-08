import {CONVERT_SUBSCRIBER_TRIGGERS} from '../constants/triggers'

import {CampaignTrigger} from '../types/CampaignTrigger'

export function isAllowedToUpdateTrigger(
    trigger: CampaignTrigger,
    isConvertSubscriber = false
): boolean {
    return CONVERT_SUBSCRIBER_TRIGGERS.includes(trigger.type)
        ? // If the current trigger is one of the advanced one
          // allow it only for beta testers
          isConvertSubscriber
        : // Otherwise allow it for all merchants
          true
}
