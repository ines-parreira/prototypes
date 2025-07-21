export enum CampaignStatus {
    Active = 'active',
    Inactive = 'inactive',
}

export function isActiveStatus(status: string): status is CampaignStatus {
    return status === CampaignStatus.Active
}
