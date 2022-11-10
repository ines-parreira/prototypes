import {BusinessHoursOperators} from '../types/enums/BusinessHoursOperators.enum'
import {CartValueOperators} from '../types/enums/CartValueOperators.enum'
import {CurrentUrlOperators} from '../types/enums/CurrentUrlOperators.enum'
import {ProductTagsOperators} from '../types/enums/ProductTagsOperators.enum'
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
