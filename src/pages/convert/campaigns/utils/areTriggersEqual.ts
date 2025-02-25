import { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'

/*
 * Compares the two triggers on equality ignoring the `id` field.
 */
export const areTriggersEqual = (a: CampaignTrigger, b: CampaignTrigger) => {
    return a.type === b.type && a.operator === b.operator && a.value === b.value
}
