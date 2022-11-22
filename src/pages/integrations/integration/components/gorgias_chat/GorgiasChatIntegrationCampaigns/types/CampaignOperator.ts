import {BusinessHoursOperators} from './enums/BusinessHoursOperators.enum'
import {CartValueOperators} from './enums/CartValueOperators.enum'
import {CurrentUrlOperators} from './enums/CurrentUrlOperators.enum'
import {DeviceTypeOperators} from './enums/DeviceTypeOperators.enum'
import {ExitIntentOperators} from './enums/ExitIntentOperators.enum'
import {ProductTagsOperators} from './enums/ProductTagsOperators.enum'
import {SessionTimeOperators} from './enums/SessionTimeOperators.enum'
import {SingleCampaignInViewOperators} from './enums/SingleCampaignInViewOperators.enum'
import {TimeSpentOnPageOperators} from './enums/TimeSpentOnPageOperators.enum'
import {VisitCountOperators} from './enums/VisitCountOperators.enum'

export type CampaignOperator =
    | CurrentUrlOperators
    | TimeSpentOnPageOperators
    | BusinessHoursOperators
    | CartValueOperators
    | ProductTagsOperators
    | VisitCountOperators
    | SessionTimeOperators
    | ExitIntentOperators
    | SingleCampaignInViewOperators
    | DeviceTypeOperators
