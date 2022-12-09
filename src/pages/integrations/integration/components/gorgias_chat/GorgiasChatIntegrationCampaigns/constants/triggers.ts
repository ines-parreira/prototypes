import {BusinessHoursOperators} from '../types/enums/BusinessHoursOperators.enum'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'
import {CartValueOperators} from '../types/enums/CartValueOperators.enum'
import {CurrentUrlOperators} from '../types/enums/CurrentUrlOperators.enum'
import {ExitIntentOperators} from '../types/enums/ExitIntentOperators.enum'
import {ProductTagsOperators} from '../types/enums/ProductTagsOperators.enum'
import {SessionTimeOperators} from '../types/enums/SessionTimeOperators.enum'
import {TimeSpentOnPageOperators} from '../types/enums/TimeSpentOnPageOperators.enum'
import {VisitCountOperators} from '../types/enums/VisitCountOperators.enum'

export const BETA_TRIGGERS = [
    CampaignTriggerKey.BusinessHours,
    CampaignTriggerKey.CartValue,
    CampaignTriggerKey.ExitIntent,
    CampaignTriggerKey.ProductTags,
    CampaignTriggerKey.SessionTime,
    CampaignTriggerKey.SingleInView,
    CampaignTriggerKey.VisitCount,
    CampaignTriggerKey.DeviceType,
]

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
    {
        key: CampaignTriggerKey.VisitCount,
        label: 'Number of visits',
        defaults: {
            value: 0,
            operator: VisitCountOperators.GreaterThan,
        },
        requirements: {
            revenue: true,
        },
    },
    {
        key: CampaignTriggerKey.SessionTime,
        label: 'Time spent per visit',
        defaults: {
            value: 0,
            operator: SessionTimeOperators.GreaterThan,
        },
        requirements: {
            revenue: true,
        },
    },
    {
        key: CampaignTriggerKey.ExitIntent,
        label: 'Exit intent',
        defaults: {
            value: 'true',
            operator: ExitIntentOperators.Equal,
        },
        requirements: {
            revenue: true,
        },
    },
    {
        key: CampaignTriggerKey.CartValue,
        label: 'Amount added to cart',
        defaults: {
            value: 0,
            operator: CartValueOperators.GreaterThan,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
        },
    },
    {
        key: CampaignTriggerKey.ProductTags,
        label: 'Product tags added to cart',
        defaults: {
            value: '',
            operator: ProductTagsOperators.Contains,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
        },
    },
]
