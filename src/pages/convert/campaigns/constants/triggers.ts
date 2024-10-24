import {CampaignTriggerBusinessHoursValuesEnum} from '../types/enums/CampaignTriggerBusinessHoursValues.enum'
import {CampaignTriggerDeviceTypeValueEnum} from '../types/enums/CampaignTriggerDeviceTypeValue.enum'
import {CampaignTriggerOperator} from '../types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from '../types/enums/CampaignTriggerType.enum'
import {TriggerConfig} from '../types/TriggerConfig'

export const CONVERT_LIGHT_TRIGGERS = [
    CampaignTriggerType.CurrentUrl,
    CampaignTriggerType.TimeSpentOnPage,
]

export const CONVERT_SHOPIFY_TRIGGERS = [
    CampaignTriggerType.AmountSpent,
    CampaignTriggerType.OrdersCount,
    CampaignTriggerType.CustomerTags,
    CampaignTriggerType.OrderedProducts,
]

export const TRIGGERS_CONFIG: TriggerConfig = {
    // --------------------
    // Behavior
    // --------------------
    [CampaignTriggerType.CurrentUrl]: {
        label: 'Current URL',
        group: 'Behavior',
        defaults: {
            value: '/',
            operator: CampaignTriggerOperator.Contains,
        },
        requirements: {},
        operators: {
            [CampaignTriggerOperator.Contains]: {
                label: 'contains',
            },

            [CampaignTriggerOperator.NotContains]: {
                label: 'not contains',
            },

            [CampaignTriggerOperator.Eq]: {
                label: 'is',
            },

            [CampaignTriggerOperator.Neq]: {
                label: 'is not',
            },

            [CampaignTriggerOperator.StartsWith]: {
                label: 'starts with',
            },

            [CampaignTriggerOperator.EndsWith]: {
                label: 'ends with',
            },
        },
    },
    [CampaignTriggerType.TimeSpentOnPage]: {
        label: 'Time spent on page',
        group: 'Behavior',
        defaults: {
            value: 0,
            operator: CampaignTriggerOperator.Gt,
        },
        requirements: {},
        operators: {
            [CampaignTriggerOperator.Gt]: {
                label: 'is greater than',
            },
        },
    },
    [CampaignTriggerType.CartProductTags]: {
        label: 'Currently visited product',
        group: 'Behavior',
        defaults: {
            value: '',
            operator: CampaignTriggerOperator.ContainsAll,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
        },
        operators: {
            [CampaignTriggerOperator.ContainsAll]: {
                label: 'contains all',
            },

            [CampaignTriggerOperator.ContainsAny]: {
                label: 'contains any',
            },
            [CampaignTriggerOperator.NotContains]: {
                label: 'not contains',
            },
        },
    },
    [CampaignTriggerType.VisitCount]: {
        label: 'Number of visits',
        group: 'Behavior',
        defaults: {
            value: 0,
            operator: CampaignTriggerOperator.Gt,
        },
        requirements: {
            revenue: true,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'equals',
            },

            [CampaignTriggerOperator.Lt]: {
                label: 'is less than',
            },

            [CampaignTriggerOperator.Gt]: {
                label: 'is greater than',
            },
        },
    },
    [CampaignTriggerType.SessionTime]: {
        label: 'Time spent per visit',
        group: 'Behavior',
        defaults: {
            value: 0,
            operator: CampaignTriggerOperator.Gt,
        },
        requirements: {
            revenue: true,
        },
        operators: {
            [CampaignTriggerOperator.Gt]: {
                label: 'is greater than',
            },
        },
    },
    [CampaignTriggerType.ExitIntent]: {
        label: 'Exit intent',
        group: 'Behavior',
        defaults: {
            value: 'true',
            operator: CampaignTriggerOperator.Eq,
        },
        requirements: {
            revenue: true,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'is detected',
            },
        },
    },
    [CampaignTriggerType.OutOfStockProductPages]: {
        label: 'Out Of Stock Product Pages',
        group: 'Behavior',
        defaults: {
            value: 'true',
            operator: CampaignTriggerOperator.Eq,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'is visited',
            },
        },
    },
    // --------------------
    // Cart
    // --------------------
    [CampaignTriggerType.ProductTags]: {
        label: 'Product tags added to cart',
        group: 'Cart',
        defaults: {
            value: '',
            operator: CampaignTriggerOperator.ContainsAll,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
        },
        operators: {
            [CampaignTriggerOperator.ContainsAll]: {
                label: 'contains all',
            },

            [CampaignTriggerOperator.ContainsAny]: {
                label: 'contains any',
            },
            [CampaignTriggerOperator.NotContains]: {
                label: 'not contains',
            },
        },
    },
    [CampaignTriggerType.CartValue]: {
        label: 'Amount added to cart',
        group: 'Cart',
        defaults: {
            value: 0,
            operator: CampaignTriggerOperator.Gt,
        },
        requirements: {
            revenue: true,
            shopify: true,
            headless: false,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'equals',
            },

            [CampaignTriggerOperator.Lt]: {
                label: 'is less than',
            },

            [CampaignTriggerOperator.Gt]: {
                label: 'is greater than',
            },
        },
    },
    // --------------------
    // Customer
    // --------------------
    [CampaignTriggerType.CustomerTags]: {
        label: 'Shopify customer tags',
        group: 'Customer',
        defaults: {
            value: '',
            operator: CampaignTriggerOperator.ContainsAny,
        },
        requirements: {
            revenue: true,
            shopify: true,
        },
        operators: {
            [CampaignTriggerOperator.ContainsAll]: {
                label: 'contains all',
            },

            [CampaignTriggerOperator.ContainsAny]: {
                label: 'contains any',
            },

            [CampaignTriggerOperator.NotContains]: {
                label: 'not contains',
            },
        },
    },
    [CampaignTriggerType.OrdersCount]: {
        label: 'Number of orders placed',
        group: 'Customer',
        defaults: {
            value: 0,
            operator: CampaignTriggerOperator.Eq,
        },
        requirements: {
            revenue: true,
            shopify: true,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'equals',
            },

            [CampaignTriggerOperator.Gt]: {
                label: 'is greater than',
            },

            [CampaignTriggerOperator.Lt]: {
                label: 'is less than',
            },
        },
    },
    [CampaignTriggerType.AmountSpent]: {
        label: 'Total spent',
        group: 'Customer',
        defaults: {
            value: 0,
            operator: CampaignTriggerOperator.Eq,
        },
        requirements: {
            revenue: true,
            shopify: true,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'equals',
            },

            [CampaignTriggerOperator.Gt]: {
                label: 'is greater than',
            },

            [CampaignTriggerOperator.Lt]: {
                label: 'is less than',
            },
        },
    },
    [CampaignTriggerType.OrderedProducts]: {
        label: 'Products purchased',
        group: 'Customer',
        defaults: {
            value: [],
            operator: CampaignTriggerOperator.ContainsAny,
        },
        requirements: {
            revenue: true,
            shopify: true,
        },
        operators: {
            [CampaignTriggerOperator.ContainsAll]: {
                label: 'contains all',
            },

            [CampaignTriggerOperator.ContainsAny]: {
                label: 'contains any',
            },

            [CampaignTriggerOperator.NotContains]: {
                label: 'not contains',
            },
        },
    },
    // --------------------
    // Other
    // --------------------
    [CampaignTriggerType.BusinessHours]: {
        label: 'Business hours',
        group: 'Other',
        defaults: {
            value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            operator: CampaignTriggerOperator.Eq,
        },
        requirements: {
            revenue: true,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'equals',
            },
        },
    },
    [CampaignTriggerType.CountryCode]: {
        label: 'Visitor location',
        group: 'Other',
        defaults: {
            value: '',
            operator: CampaignTriggerOperator.In,
        },
        requirements: {
            revenue: true,
            shopify: true,
        },
        operators: {
            [CampaignTriggerOperator.In]: {
                label: 'is',
            },

            [CampaignTriggerOperator.NotIn]: {
                label: 'is not',
            },
        },
    },
    // --------------------
    // Hidden
    // --------------------
    [CampaignTriggerType.IncognitoVisitor]: {
        label: 'IncognitoVisitor',
        group: 'Other',
        defaults: {
            value: 'true',
            operator: CampaignTriggerOperator.Eq,
        },
        requirements: {
            revenue: true,
            hidden: true,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'equals',
            },
        },
    },
    [CampaignTriggerType.SingleInView]: {
        label: 'Single campaign in view',
        group: 'Other',
        defaults: {
            value: 'true',
            operator: CampaignTriggerOperator.Eq,
        },
        requirements: {
            revenue: true,
            hidden: true,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'equals',
            },
        },
    },
    [CampaignTriggerType.DeviceType]: {
        label: 'Device type',
        group: 'Other',
        defaults: {
            value: CampaignTriggerDeviceTypeValueEnum.All,
            operator: CampaignTriggerOperator.Eq,
        },
        requirements: {
            hidden: true,
        },
        operators: {
            [CampaignTriggerOperator.Eq]: {
                label: 'equals',
            },
        },
    },
}
