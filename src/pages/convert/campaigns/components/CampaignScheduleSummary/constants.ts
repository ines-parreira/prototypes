import {CampaignScheduleTypeValueEnum} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'

export const SCHEDULE_RULE_LABELS: Record<string, string> = {
    [CampaignScheduleTypeValueEnum.AllDay]: 'all day',
    [CampaignScheduleTypeValueEnum.During]: 'during of business hours',
    [CampaignScheduleTypeValueEnum.Outside]: 'outside of business hours',
}
