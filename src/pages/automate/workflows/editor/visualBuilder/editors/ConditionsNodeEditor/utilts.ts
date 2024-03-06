import {ConditionSchema} from 'pages/automate/workflows/models/conditions.types'

export const isIntervalOperator = (
    nextKey: AllKeys<ConditionSchema>
): nextKey is 'lessThanInterval' | 'greaterThanInterval' =>
    nextKey === 'lessThanInterval' || nextKey === 'greaterThanInterval'

export const isBooleanOperator = (
    key: AllKeys<ConditionSchema>
): key is 'exists' | 'doesNotExist' =>
    key === 'exists' || key === 'doesNotExist'

export const isStringOrNumberOperator = (
    key: AllKeys<ConditionSchema>
): key is
    | 'equals'
    | 'notEqual'
    | 'contains'
    | 'doesNotContain'
    | 'endsWith'
    | 'startsWith'
    | 'lessThan'
    | 'greaterThan'
    | 'greaterOrEqual' =>
    key === 'equals' ||
    key === 'notEqual' ||
    key === 'contains' ||
    key === 'doesNotContain' ||
    key === 'endsWith' ||
    key === 'startsWith' ||
    key === 'lessThan' ||
    key === 'greaterThan' ||
    key === 'greaterOrEqual'
