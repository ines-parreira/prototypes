export enum CampaignTriggerDeviceTypeValueEnum {
    All = 'all',
    Desktop = 'desktop',
    Mobile = 'mobile',
}

export function isDeviceTypeValue(value: string) {
    return Object.values(CampaignTriggerDeviceTypeValueEnum).includes(
        value as CampaignTriggerDeviceTypeValueEnum,
    )
}
