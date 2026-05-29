import type {
    Condition,
    ConditionField,
    ConditionFieldCategory,
    ConditionOperator,
    ConditionValueOption,
    LogicOperator,
} from 'pages/aiAgent/actionsV2/sidePanel/actionForm/ConditionBuilder/types'
import {
    BOOLEAN_CONDITION_OPERATORS,
    DATE_CONDITION_OPERATORS,
    getOperatorListByVariable,
    NUMBER_CONDITION_OPERATORS,
    STRING_CONDITION_OPERATORS,
} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/constants'
import {
    isExistenceOperator,
    isIntervalOperator,
} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/utils'
import type {
    ConditionKey,
    ConditionSchema,
    ConditionsSchema,
    VarSchema,
} from 'pages/automate/workflows/models/conditions.types'
import type {
    WorkflowVariable,
    WorkflowVariableGroup,
    WorkflowVariableList,
} from 'pages/automate/workflows/models/variables.types'

type LegacyConditionsType = keyof ConditionsSchema | null

const UNCATEGORIZED_CATEGORY_ID = 'general'

const INTERVAL_VALUE_OPTIONS: ConditionValueOption[] = [
    { value: '-1d', label: '1 day ago' },
    { value: '-3d', label: '3 days ago' },
    { value: '-7d', label: '7 days ago' },
    { value: '-14d', label: '14 days ago' },
    { value: '-30d', label: '30 days ago' },
    { value: '-1h', label: '1 hour ago' },
    { value: '-24h', label: '24 hours ago' },
]

const BOOLEAN_VALUE_OPTIONS: ConditionValueOption[] = [
    { value: 'true', label: 'True' },
    { value: 'false', label: 'False' },
]

export const logicOperatorFromConditionsType = (
    type: LegacyConditionsType,
): LogicOperator => {
    if (type === 'and') return 'all'
    if (type === 'or') return 'any'
    return 'none'
}

export const conditionsTypeFromLogicOperator = (
    op: LogicOperator,
): LegacyConditionsType => {
    if (op === 'all') return 'and'
    if (op === 'any') return 'or'
    return null
}

const flattenVariables = (
    variables: WorkflowVariableList,
    category: string,
): { variable: WorkflowVariable; category: string }[] => {
    const out: { variable: WorkflowVariable; category: string }[] = []
    for (const entry of variables) {
        if ('variables' in entry) {
            out.push(
                ...flattenVariables(
                    (entry as WorkflowVariableGroup).variables,
                    entry.name,
                ),
            )
        } else {
            out.push({ variable: entry as WorkflowVariable, category })
        }
    }
    return out
}

const fieldTypeFromVariable = (
    variable: WorkflowVariable,
): ConditionField['type'] => {
    if (variable.type === 'string' && variable.options?.length) return 'enum'
    if (
        variable.type === 'string' ||
        variable.type === 'number' ||
        variable.type === 'boolean' ||
        variable.type === 'date'
    ) {
        return variable.type
    }
    return 'string'
}

export const buildFieldsFromVariables = (variables: WorkflowVariableList) => {
    const flat = flattenVariables(variables, UNCATEGORIZED_CATEGORY_ID)
    const variableById = new Map<string, WorkflowVariable>()
    const categoryIds = new Set<string>()
    const fields: ConditionField[] = flat.map(({ variable, category }) => {
        variableById.set(variable.value, variable)
        categoryIds.add(category)
        return {
            id: variable.value,
            label: variable.name,
            type: fieldTypeFromVariable(variable),
            category,
        }
    })
    const categories: ConditionFieldCategory[] = Array.from(categoryIds).map(
        (id) => ({
            id,
            label: id === UNCATEGORIZED_CATEGORY_ID ? 'General' : id,
        }),
    )
    return { fields, categories, variableById }
}

const operatorListFor = (variable: WorkflowVariable | undefined) => {
    if (!variable) return STRING_CONDITION_OPERATORS
    switch (variable.type) {
        case 'date':
            return DATE_CONDITION_OPERATORS
        case 'number':
            return NUMBER_CONDITION_OPERATORS
        case 'boolean':
            return BOOLEAN_CONDITION_OPERATORS
        case 'string':
            return getOperatorListByVariable(variable)
        default:
            return STRING_CONDITION_OPERATORS
    }
}

export const makeGetOperators =
    (variableById: Map<string, WorkflowVariable>) =>
    (fieldId: string): ConditionOperator[] =>
        operatorListFor(variableById.get(fieldId)).map((op) => ({
            id: op.key,
            label: op.label,
        }))

export const makeGetValueOptions =
    (variableById: Map<string, WorkflowVariable>) =>
    (condition: Condition): ConditionValueOption[] | undefined => {
        const variable = variableById.get(condition.field)
        const operatorKey = condition.operator as ConditionKey | undefined

        if (operatorKey && isExistenceOperator(operatorKey)) {
            return []
        }
        if (operatorKey && isIntervalOperator(operatorKey)) {
            return INTERVAL_VALUE_OPTIONS
        }
        if (variable?.type === 'boolean') {
            return BOOLEAN_VALUE_OPTIONS
        }
        if (variable?.type === 'string' && variable.options?.length) {
            return variable.options.map((option) => ({
                value: option.value ?? '',
                label: option.label,
            }))
        }
        return undefined
    }

const stringifyValue = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return String(value)
}

export const legacyToV2Conditions = (legacy: ConditionSchema[]): Condition[] =>
    legacy.map((schema, index) => {
        const operatorKey = Object.keys(schema)[0] as ConditionKey
        const tuple = (
            schema as unknown as Record<ConditionKey, [VarSchema, unknown?]>
        )[operatorKey]
        const fieldId = tuple[0].var
        const value = isExistenceOperator(operatorKey) ? '' : tuple[1]
        return {
            id: `legacy-${index}-${fieldId}-${operatorKey}`,
            field: fieldId,
            operator: operatorKey,
            value: stringifyValue(value),
        }
    })

const parseValueForOperator = (
    operatorKey: ConditionKey,
    variable: WorkflowVariable | undefined,
    rawValue: string,
): unknown => {
    if (isExistenceOperator(operatorKey)) return undefined
    if (isIntervalOperator(operatorKey)) {
        return rawValue || '-1d'
    }
    if (variable?.type === 'boolean') {
        if (rawValue === 'true') return true
        if (rawValue === 'false') return false
        return undefined
    }
    if (variable?.type === 'number') {
        if (rawValue === '') return undefined
        const parsed = Number(rawValue)
        return Number.isNaN(parsed) ? undefined : parsed
    }
    if (variable?.type === 'date') {
        return rawValue || undefined
    }
    return rawValue === '' ? undefined : rawValue
}

export const v2ToLegacyCondition = (
    condition: Condition,
    variableById: Map<string, WorkflowVariable>,
): ConditionSchema => {
    const variable = variableById.get(condition.field)
    const operatorKey = condition.operator as ConditionKey
    const variableRef: VarSchema = { var: condition.field }
    if (isExistenceOperator(operatorKey)) {
        return { [operatorKey]: [variableRef] } as unknown as ConditionSchema
    }
    const value = parseValueForOperator(operatorKey, variable, condition.value)
    return {
        [operatorKey]: [variableRef, value],
    } as unknown as ConditionSchema
}
