import { CampaignScheduleRuleValueEnum } from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'

export type CustomScheduleSchema = {
    days: string
    from_time: string
    to_time: string
}

export type ScheduleSchema = {
    start_datetime: string
    end_datetime?: string | null
    schedule_rule: CampaignScheduleRuleValueEnum
    custom_schedule: CustomScheduleSchema[] | null
}
