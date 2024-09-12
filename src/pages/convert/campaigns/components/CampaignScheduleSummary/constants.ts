import {CampaignScheduleRuleValueEnum} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'

export const SCHEDULE_RULE_LABELS: Record<string, string> = {
    [CampaignScheduleRuleValueEnum.AllDay]: 'all day',
    [CampaignScheduleRuleValueEnum.During]: 'during of business hours',
    [CampaignScheduleRuleValueEnum.Outside]: 'outside of business hours',
}
