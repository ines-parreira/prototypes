import { CampaignTriggerMap } from 'pages/convert/campaigns/types/CampaignTriggerMap'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'

import { createTrigger } from './createTrigger'

export const getDefaultTriggers = (
    isConvertSubscriber: boolean,
): CampaignTriggerMap => {
    const currentUrlTriger = createTrigger(CampaignTriggerType.CurrentUrl)
    const defaultTriggers = {
        [currentUrlTriger.id]: currentUrlTriger,
    }

    if (isConvertSubscriber) {
        const businessHourTrigger = createTrigger(
            CampaignTriggerType.BusinessHours,
        )
        defaultTriggers[businessHourTrigger.id] = businessHourTrigger
    }

    return defaultTriggers
}
