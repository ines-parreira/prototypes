import { ulid } from 'ulidx'

import { TRIGGERS_CONFIG } from '../constants/triggers'
import type { CampaignTrigger } from '../types/CampaignTrigger'
import type { CampaignTriggerType } from '../types/enums/CampaignTriggerType.enum'

export function createTrigger(
    triggerType: CampaignTriggerType,
): CampaignTrigger {
    const trigger = TRIGGERS_CONFIG[triggerType]
    if (trigger) {
        return {
            id: ulid(),
            type: triggerType,
            operator: trigger.defaults.operator,
            value: trigger.defaults.value,
        }
    }

    throw new Error(`Trigger type "${triggerType}" not implemented!`)
}
