import {BusinessHoursOperators} from '../types/enums/BusinessHoursOperators.enum'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'
import {CartValueOperators} from '../types/enums/CartValueOperators.enum'
import {CountryOperators} from '../types/enums/CountryOperators.enum'
import {CurrentProductTagsOperators} from '../types/enums/CurrentProductTagsOperators.enum'
import {CurrentUrlOperators} from '../types/enums/CurrentUrlOperators.enum'
import {ExitIntentOperators} from '../types/enums/ExitIntentOperators.enum'
import {OrderedProductsOperators} from '../types/enums/OrderedProductsOperators.enum'
import {OrdersCountOperators} from '../types/enums/OrdersCountOperators.enum'
import {ProductTagsOperators} from '../types/enums/ProductTagsOperators.enum'
import {SessionTimeOperators} from '../types/enums/SessionTimeOperators.enum'
import {ShopifyTagsOperators} from '../types/enums/ShopifyTagsOperators.enum'
import {TimeSpentOnPageOperators} from '../types/enums/TimeSpentOnPageOperators.enum'
import {VisitCountOperators} from '../types/enums/VisitCountOperators.enum'

export const BETA_TRIGGERS = [
    CampaignTriggerKey.BusinessHours,
    CampaignTriggerKey.CartValue,
    CampaignTriggerKey.ExitIntent,
    CampaignTriggerKey.ProductTags,
    CampaignTriggerKey.CurrentProductTags,
    CampaignTriggerKey.SessionTime,
    CampaignTriggerKey.SingleInView,
    CampaignTriggerKey.VisitCount,
    CampaignTriggerKey.DeviceType,
]

export const TRIGGER_LIST = [
    // --------------------
    // Behavior
    // --------------------
    {
        key: CampaignTriggerKey.CurrentUrl,
        label: 'Current URL',
        group: 'Behavior',
        defaults: {
            value: '/',
            operator: CurrentUrlOperators.Equal,
        },
        requirements: {},
    },
    {
        key: CampaignTriggerKey.TimeSpentOnPage,
        label: 'Time spent on page',
        group: 'Behavior',
        defaults: {
            value: 0,
            operator: TimeSpentOnPageOperators.GreaterThan,
        },
        requirements: {},
    },
    {
        key: CampaignTriggerKey.CurrentProductTags,
        label: 'Currently visited product',
        group: 'Behavior',
        defaults: {
            value: '',
            operator: CurrentProductTagsOperators.Contains,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
        },
    },
    {
        key: CampaignTriggerKey.VisitCount,
        label: 'Number of visits',
        group: 'Behavior',
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
        group: 'Behavior',
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
        group: 'Behavior',
        defaults: {
            value: 'true',
            operator: ExitIntentOperators.Equal,
        },
        requirements: {
            revenue: true,
        },
    },
    // --------------------
    // Cart
    // --------------------
    {
        key: CampaignTriggerKey.ProductTags,
        label: 'Product tags added to cart',
        group: 'Cart',
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
    {
        key: CampaignTriggerKey.CartValue,
        label: 'Amount added to cart',
        group: 'Cart',
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
    // --------------------
    // Customer
    // --------------------
    {
        key: CampaignTriggerKey.CustomerTags,
        label: 'Shopify customer tags',
        group: 'Customer',
        defaults: {
            value: '',
            operator: ShopifyTagsOperators.ContainsAny,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
            shopify_history: true,
        },
    },
    {
        key: CampaignTriggerKey.CountryCode,
        label: 'Customer country',
        group: 'Customer',
        defaults: {
            value: '',
            operator: CountryOperators.In,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
            shopify_history: true,
        },
    },
    {
        key: CampaignTriggerKey.OrdersCount,
        label: 'Number of orders placed',
        group: 'Customer',
        defaults: {
            value: '',
            operator: OrdersCountOperators.Equal,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
            shopify_history: true,
        },
    },
    {
        key: CampaignTriggerKey.AmountSpent,
        label: 'Total spent',
        group: 'Customer',
        defaults: {
            value: '',
            operator: OrdersCountOperators.Equal,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
            shopify_history: true,
        },
    },
    {
        key: CampaignTriggerKey.OrderedProducts,
        label: 'Products purchased',
        group: 'Customer',
        defaults: {
            value: [],
            operator: OrderedProductsOperators.ContainsAny,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
            shopify_history: true,
        },
    },
    // --------------------
    // Other
    // --------------------
    {
        key: CampaignTriggerKey.BusinessHours,
        label: 'Business hours',
        group: 'Other',
        defaults: {
            value: true,
            operator: BusinessHoursOperators.DuringHours,
        },
        requirements: {
            revenue: true,
        },
    },
]
