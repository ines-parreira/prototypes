import {BusinessHoursOperators} from './enums/BusinessHoursOperators.enum'
import {CurrentUrlOperators} from './enums/CurrentUrlOperators.enum'
import {TimeSpentOnPageOperators} from './enums/TimeSpentOnPageOperators.enum'

export type CampaignOperator =
    | CurrentUrlOperators
    | TimeSpentOnPageOperators
    | BusinessHoursOperators
