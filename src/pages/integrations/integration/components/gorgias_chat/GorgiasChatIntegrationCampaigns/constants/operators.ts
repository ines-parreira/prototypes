import {BusinessHoursOperators} from '../types/enums/BusinessHoursOperators.enum'
import {CurrentUrlOperators} from '../types/enums/CurrentUrlOperators.enum'

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
