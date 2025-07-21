export enum CampaignStepsKeys {
    Basics = 'basics',
    Audience = 'audience',
    Message = 'message',
    PublishSchedule = 'publish_schedule',
}

export function isCampaignStepsKeys(
    key: string | null,
): key is CampaignStepsKeys {
    return Object.values(CampaignStepsKeys).includes(key as CampaignStepsKeys)
}
