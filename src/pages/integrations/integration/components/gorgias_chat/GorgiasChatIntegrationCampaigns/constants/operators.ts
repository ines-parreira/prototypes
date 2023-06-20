import {AmountSpentOperators} from '../types/enums/AmountSpentOperators.enum'
import {BusinessHoursOperators} from '../types/enums/BusinessHoursOperators.enum'
import {CartValueOperators} from '../types/enums/CartValueOperators.enum'
import {CountryOperators} from '../types/enums/CountryOperators.enum'
import {CurrentProductTagsOperators} from '../types/enums/CurrentProductTagsOperators.enum'
import {CurrentUrlOperators} from '../types/enums/CurrentUrlOperators.enum'
import {DeviceTypeOperators} from '../types/enums/DeviceTypeOperators.enum'
import {OrderedProductsOperators} from '../types/enums/OrderedProductsOperators.enum'
import {OrdersCountOperators} from '../types/enums/OrdersCountOperators.enum'
import {ProductTagsOperators} from '../types/enums/ProductTagsOperators.enum'
import {ShopifyTagsOperators} from '../types/enums/ShopifyTagsOperators.enum'
import {VisitCountOperators} from '../types/enums/VisitCountOperators.enum'

export const CURRENT_URL_OPERATORS = [
    {
        label: 'Is',
        value: CurrentUrlOperators.Equal,
    },
    {
        label: 'Is not',
        value: CurrentUrlOperators.NotEqual,
    },
    {
        label: 'Contains',
        value: CurrentUrlOperators.Contains,
    },
    {
        label: 'Not contains',
        value: CurrentUrlOperators.NotContains,
    },
    {
        label: 'Starts with',
        value: CurrentUrlOperators.StartsWith,
    },
    {
        label: 'Ends with',
        value: CurrentUrlOperators.EndsWith,
    },
]

export const BUSINESS_HOURS_OPERATORS = [
    {
        label: 'During business hours',
        value: BusinessHoursOperators.DuringHours,
    },
    {
        label: 'Outside business hours',
        value: BusinessHoursOperators.OutsideHours,
    },
    {
        label: 'Anytime',
        value: BusinessHoursOperators.Anytime,
    },
]

export const CART_VALUE_OPERATORS = [
    {
        label: 'equals',
        value: CartValueOperators.Equal,
    },
    {
        label: 'is less than',
        value: CartValueOperators.LessThan,
    },
    {
        label: 'is greater than',
        value: CartValueOperators.GreaterThan,
    },
]

export const VISIT_COUNT_OPERATORS = [
    {
        label: 'equals',
        value: VisitCountOperators.Equal,
    },
    {
        label: 'is less than',
        value: VisitCountOperators.LessThan,
    },
    {
        label: 'is greater than',
        value: VisitCountOperators.GreaterThan,
    },
]

export const PRODUCT_TAGS_OPERATORS = [
    {
        label: 'equals',
        value: ProductTagsOperators.Equal,
    },
    {
        label: 'contains',
        value: ProductTagsOperators.Contains,
    },
]

export const CURRENT_PRODUCT_TAGS_OPERATORS = [
    {
        label: 'equals',
        value: CurrentProductTagsOperators.Equal,
    },
    {
        label: 'contains',
        value: CurrentProductTagsOperators.Contains,
    },
]

export const DEVICE_TYPE_OPERATORS = [
    {
        value: DeviceTypeOperators.All,
        label: 'Desktop and mobile',
    },
    {
        value: DeviceTypeOperators.Desktop,
        label: 'Only desktop',
    },
    {
        value: DeviceTypeOperators.Mobile,
        label: 'Only mobile',
    },
]

export const ORDERS_COUNT_OPERATORS = [
    {
        label: 'is greater than',
        value: OrdersCountOperators.GreaterThan,
    },
    {
        label: 'is greater or equal to',
        value: OrdersCountOperators.GreaterOrEqual,
    },
    {
        label: 'is less than',
        value: OrdersCountOperators.LessThan,
    },
    {
        label: 'is less or equal to',
        value: OrdersCountOperators.LessOrEqual,
    },
    {
        label: 'equals',
        value: OrdersCountOperators.Equal,
    },
    {
        label: 'not equals',
        value: OrdersCountOperators.NotEqual,
    },
]

export const AMOUNT_SPENT_OPERATORS = [
    {
        label: 'is greater than',
        value: AmountSpentOperators.GreaterThan,
    },
    {
        label: 'is greater or equal to',
        value: AmountSpentOperators.GreaterOrEqual,
    },
    {
        label: 'is less than',
        value: AmountSpentOperators.LessThan,
    },
    {
        label: 'is less or equal to',
        value: AmountSpentOperators.LessOrEqual,
    },
    {
        label: 'equals',
        value: AmountSpentOperators.Equal,
    },
    {
        label: 'not equals',
        value: AmountSpentOperators.NotEqual,
    },
]

export const ORDERED_PRODUCTS_OPERATORS = [
    {
        label: 'contains',
        value: OrderedProductsOperators.Contains,
    },
    {
        label: 'Not contains',
        value: OrderedProductsOperators.NotContains,
    },
    {
        label: 'In',
        value: CountryOperators.In,
    },
    {
        label: 'Not in',
        value: CountryOperators.NotIn,
    },
]

export const SHOPIFY_TAGS_OPERATORS = [
    {
        label: 'contains',
        value: ShopifyTagsOperators.Contains,
    },
    {
        label: 'Not contains',
        value: ShopifyTagsOperators.NotContains,
    },
    {
        label: 'In',
        value: CountryOperators.In,
    },
    {
        label: 'Not in',
        value: CountryOperators.NotIn,
    },
]

export const COUNTRY_OPERATORS = [
    {
        label: 'contains',
        value: CountryOperators.Contains,
    },
    {
        label: 'Not contains',
        value: CountryOperators.NotContains,
    },
    {
        label: 'In',
        value: CountryOperators.In,
    },
    {
        label: 'Not in',
        value: CountryOperators.NotIn,
    },
]
