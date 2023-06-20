import {AmountSpentOperators} from './enums/AmountSpentOperators.enum'
import {BusinessHoursOperators} from './enums/BusinessHoursOperators.enum'
import {CartValueOperators} from './enums/CartValueOperators.enum'
import {CountryOperators} from './enums/CountryOperators.enum'
import {CurrentProductTagsOperators} from './enums/CurrentProductTagsOperators.enum'
import {CurrentUrlOperators} from './enums/CurrentUrlOperators.enum'
import {DeviceTypeOperators} from './enums/DeviceTypeOperators.enum'
import {ExitIntentOperators} from './enums/ExitIntentOperators.enum'
import {OrderedProductsOperators} from './enums/OrderedProductsOperators.enum'
import {OrdersCountOperators} from './enums/OrdersCountOperators.enum'
import {ProductTagsOperators} from './enums/ProductTagsOperators.enum'
import {SessionTimeOperators} from './enums/SessionTimeOperators.enum'
import {ShopifyTagsOperators} from './enums/ShopifyTagsOperators.enum'
import {SingleCampaignInViewOperators} from './enums/SingleCampaignInViewOperators.enum'
import {TimeSpentOnPageOperators} from './enums/TimeSpentOnPageOperators.enum'
import {VisitCountOperators} from './enums/VisitCountOperators.enum'

export type CampaignOperator =
    | CurrentUrlOperators
    | TimeSpentOnPageOperators
    | BusinessHoursOperators
    | CartValueOperators
    | ProductTagsOperators
    | CurrentProductTagsOperators
    | VisitCountOperators
    | SessionTimeOperators
    | ExitIntentOperators
    | SingleCampaignInViewOperators
    | DeviceTypeOperators
    | OrdersCountOperators
    | AmountSpentOperators
    | OrderedProductsOperators
    | ShopifyTagsOperators
    | CountryOperators
