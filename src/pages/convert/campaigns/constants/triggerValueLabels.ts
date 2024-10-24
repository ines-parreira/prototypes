import {CampaignTriggerBusinessHoursValuesEnum} from '../types/enums/CampaignTriggerBusinessHoursValues.enum'
import {CampaignTriggerDeviceTypeValueEnum} from '../types/enums/CampaignTriggerDeviceTypeValue.enum'

export const BUSINESS_HOURS_VALUES = [
    {
        value: CampaignTriggerBusinessHoursValuesEnum.During,
        label: 'During business hours',
    },
    {
        value: CampaignTriggerBusinessHoursValuesEnum.Outside,
        label: 'Outside business hours',
    },
    {
        value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
        label: 'Anytime',
    },
]

export const DEVICE_TYPE_VALUES = [
    {
        value: CampaignTriggerDeviceTypeValueEnum.All,
        label: 'Desktop and mobile',
    },
    {
        value: CampaignTriggerDeviceTypeValueEnum.Desktop,
        label: 'Only desktop',
    },
    {
        value: CampaignTriggerDeviceTypeValueEnum.Mobile,
        label: 'Only mobile',
    },
]
