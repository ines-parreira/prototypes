import {CampaignScheduleTypeValueEnum} from '../types/enums/CampaignScheduleSettingsValues.enum'

export const DURATION_VALUES = [
    {
        value: CampaignScheduleTypeValueEnum.AllDay,
        label: 'All day',
    },
    {
        value: CampaignScheduleTypeValueEnum.During,
        label: 'Business hours',
    },
    {
        value: CampaignScheduleTypeValueEnum.Outside,
        label: 'Outside business hours',
    },
    {
        value: CampaignScheduleTypeValueEnum.Custom,
        label: 'Custom hours',
    },
]
