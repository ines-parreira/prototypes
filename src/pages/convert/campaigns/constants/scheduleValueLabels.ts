import {CampaignScheduleRuleValueEnum} from '../types/enums/CampaignScheduleSettingsValues.enum'

export const DURATION_VALUES = [
    {
        value: CampaignScheduleRuleValueEnum.AllDay,
        label: 'All day',
    },
    {
        value: CampaignScheduleRuleValueEnum.During,
        label: 'Business hours',
    },
    {
        value: CampaignScheduleRuleValueEnum.Outside,
        label: 'Outside business hours',
    },
    {
        value: CampaignScheduleRuleValueEnum.Custom,
        label: 'Custom hours',
    },
]
