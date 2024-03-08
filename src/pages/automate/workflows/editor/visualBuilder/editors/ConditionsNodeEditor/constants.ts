import {ConditionKey} from 'pages/automate/workflows/models/conditions.types'

export interface ConditionOperator {
    label: string
    key: ConditionKey
}

export const TIMEPERIOD_REGEX = /^(?<value>\d+)(?<unit>[mhdw])$/

export const STRING_CONDITION_OPERATORS: ConditionOperator[] = [
    {
        label: 'Is',
        key: 'equals',
    },
    {
        label: 'Is not',
        key: 'notEqual',
    },
    {
        label: 'Starts with',
        key: 'startsWith',
    },
    {
        label: 'Ends with',
        key: 'endsWith',
    },
    {
        label: 'Contains',
        key: 'contains',
    },
    {
        label: 'Does not contain',
        key: 'doesNotContain',
    },
    {
        label: 'Does not exist',
        key: 'doesNotExist',
    },
    {
        label: 'Exists',
        key: 'exists',
    },
]
export const BOOLEAN_CONDITION_OPERATORS: ConditionOperator[] = [
    {
        label: 'Is',
        key: 'equals',
    },
]

export const NUMBER_CONDITION_OPERATORS: ConditionOperator[] = [
    {
        label: '(=) equals',
        key: 'equals',
    },
    {
        label: '(≠) does not equal',
        key: 'notEqual',
    },
    {
        label: '(>) is greater than',
        key: 'greaterThan',
    },
    {
        label: '(≥) is greater than or equal to',
        key: 'greaterOrEqual',
    },
    {
        label: '(<) is less than',
        key: 'lessThan',
    },
    {
        label: '(≤) is less than or equal to',
        key: 'lessOrEqual',
    },
    {
        label: 'Exists',
        key: 'exists',
    },
    {
        label: 'Does not exist',
        key: 'doesNotExist',
    },
]

export const DATE_CONDITION_OPERATORS: ConditionOperator[] = [
    {
        label: 'Is before',
        key: 'lessThan',
    },
    {
        label: 'Is after',
        key: 'greaterThan',
    },
    {
        label: 'Is less than',
        key: 'lessThanInterval',
    },
    {
        label: 'Is more than',
        key: 'greaterThanInterval',
    },
    {
        label: 'Exists',
        key: 'exists',
    },
    {
        label: 'Does not exist',
        key: 'doesNotExist',
    },
]

export const getOperatorListByType = (type: string) => {
    if (type === 'date') {
        return DATE_CONDITION_OPERATORS
    }
    if (type === 'number') {
        return NUMBER_CONDITION_OPERATORS
    }
    if (type === 'boolean') {
        return BOOLEAN_CONDITION_OPERATORS
    }
    if (type === 'string') {
        return STRING_CONDITION_OPERATORS
    }
    return []
}
