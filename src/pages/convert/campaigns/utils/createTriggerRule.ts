import { CampaignTrigger } from '../types/CampaignTrigger'

export const createTriggerRule = (triggers: CampaignTrigger[]) => {
    return triggers.map((trigger) => `{${trigger.id}}`).join(' && ')
}
