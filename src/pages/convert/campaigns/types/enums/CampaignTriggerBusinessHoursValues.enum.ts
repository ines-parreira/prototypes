export enum CampaignTriggerBusinessHoursValuesEnum {
    During = 'during',
    Outside = 'outside',
    Anytime = 'anytime',
}

export function isBusinessHoursValue(value: string) {
    return Object.values(CampaignTriggerBusinessHoursValuesEnum).includes(
        value as CampaignTriggerBusinessHoursValuesEnum
    )
}
