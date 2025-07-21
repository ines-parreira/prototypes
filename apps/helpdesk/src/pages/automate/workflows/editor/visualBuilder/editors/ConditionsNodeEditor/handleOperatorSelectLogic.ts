import { produce } from 'immer'

import {
    ConditionKey,
    ConditionSchema,
} from 'pages/automate/workflows/models/conditions.types'
import { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'

import {
    getDefaultValueForType,
    isExistenceOperator,
    isIntervalOperator,
    isStringOrNumberOperator,
} from './utils'

export function handleOperatorSelectLogic(
    condition: ConditionSchema,
    nextKey: ConditionKey,
    variable: WorkflowVariable,
): ConditionSchema {
    const key = Object.keys(condition)[0] as keyof ConditionSchema
    if (nextKey === key) return condition

    const defaultValue = getDefaultValueForType(variable.type)

    return produce(condition, (draft) => {
        const schema = draft[key]
        if (!schema) return

        if (
            isIntervalOperator(nextKey) &&
            key !== 'lessThanInterval' &&
            key !== 'greaterThanInterval'
        ) {
            draft[nextKey] = [schema[0], '-1d']
        } else if (isExistenceOperator(nextKey)) {
            draft[nextKey] = [schema[0]]
        } else if (
            isExistenceOperator(key) &&
            isStringOrNumberOperator(nextKey)
        ) {
            // @ts-expect-error - Runtime determines correct default value type
            draft[nextKey] = [schema[0], defaultValue]
        } else if (
            (nextKey === 'lessThan' && key !== 'greaterThan') ||
            (nextKey === 'greaterThan' && key !== 'lessThan')
        ) {
            draft[nextKey] = [schema[0], defaultValue]
        } else {
            // @ts-expect-error - Runtime determines correct default value type
            draft[nextKey] = draft[key]
        }

        delete draft[key]
    })
}
