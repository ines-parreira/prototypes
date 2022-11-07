import {BusinessHoursOperators} from '../types/enums/BusinessHoursOperators.enum'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'
import {CurrentUrlOperators} from '../types/enums/CurrentUrlOperators.enum'
import {TimeSpentOnPageOperators} from '../types/enums/TimeSpentOnPageOperators.enum'

export const TRIGGER_LIST = [
    {
        key: CampaignTriggerKey.BusinessHours,
        label: 'Business hours',
        defaults: {
            value: true,
            operator: BusinessHoursOperators.DuringHours,
        },
        requirements: {
            revenue: true,
        },
    },
    {
        key: CampaignTriggerKey.CurrentUrl,
        label: 'Current URL',
        defaults: {
            value: '/',
            operator: CurrentUrlOperators.Equal,
        },
        requirements: {},
    },
    {
        key: CampaignTriggerKey.TimeSpentOnPage,
        label: 'Time spent on page',
        defaults: {
            value: 0,
            operator: TimeSpentOnPageOperators.GreaterThan,
        },
        requirements: {},
    },
]
