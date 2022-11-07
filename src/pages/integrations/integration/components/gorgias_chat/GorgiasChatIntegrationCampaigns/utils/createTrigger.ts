import {TRIGGER_LIST} from '../constants/triggers'

import {CampaignTrigger} from '../types/CampaignTrigger'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'

export function createTrigger(key: CampaignTriggerKey): CampaignTrigger {
    const trigger = TRIGGER_LIST.find((trigger) => trigger.key === key)
    if (trigger) {
        return {
            key,
            value: trigger.defaults.value,
            operator: trigger.defaults.operator,
        }
    }

    throw new Error(`Trigger key "${key}" not implemented!`)
}
