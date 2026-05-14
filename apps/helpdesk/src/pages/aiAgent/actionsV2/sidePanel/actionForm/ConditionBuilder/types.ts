export type LogicOperator = 'none' | 'all' | 'any'

export type ConditionFieldType =
    | 'string'
    | 'number'
    | 'date'
    | 'enum'
    | 'boolean'

export type ConditionField = {
    id: string
    label: string
    type: ConditionFieldType
    category?: string
}

export type ConditionFieldCategory = {
    id: string
    label: string
    iconName?: string
}

export type ConditionOperator = {
    id: string
    label: string
}

export type ConditionValueOption = {
    value: string
    label: string
}

export type Condition = {
    id: string
    field: string
    operator: string
    value: string
}
