import type { ConditionSchema } from 'pages/automate/workflows/models/conditions.types'
import type { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'

export const buildConditionSchemaByVariableType = (
    type: WorkflowVariable['type'],
    variable: string,
): ConditionSchema => {
    switch (type) {
        case 'string':
            return {
                equals: [{ var: variable }, undefined],
            }
        case 'number':
            return {
                equals: [{ var: variable }, 0],
            }
        case 'boolean':
            return {
                equals: [{ var: variable }, true],
            }
        case 'date':
            return {
                lessThan: [{ var: variable }, undefined],
            }
        default:
            return {
                exists: [{ var: variable }],
            }
    }
}

export const isIntervalOperator = (
    nextKey: AllKeys<ConditionSchema>,
): nextKey is 'lessThanInterval' | 'greaterThanInterval' =>
    nextKey === 'lessThanInterval' || nextKey === 'greaterThanInterval'

export const isExistenceOperator = (
    key: AllKeys<ConditionSchema>,
): key is 'exists' | 'doesNotExist' =>
    key === 'exists' || key === 'doesNotExist'

export const isStringOrNumberOperator = (
    key: AllKeys<ConditionSchema>,
): key is
    | 'equals'
    | 'notEqual'
    | 'contains'
    | 'doesNotContain'
    | 'endsWith'
    | 'startsWith'
    | 'lessThan'
    | 'greaterThan'
    | 'greaterOrEqual'
    | 'lessOrEqual' =>
    key === 'equals' ||
    key === 'notEqual' ||
    key === 'contains' ||
    key === 'doesNotContain' ||
    key === 'endsWith' ||
    key === 'startsWith' ||
    key === 'lessThan' ||
    key === 'greaterThan' ||
    key === 'greaterOrEqual' ||
    key === 'lessOrEqual'

export const getDefaultValueForType = (type: WorkflowVariable['type']) => {
    switch (type) {
        case 'number':
            return 0
        case 'string':
            return ''
        default:
            return undefined
    }
}
