import type { FieldType } from '@gorgias/customer-segmentation-types'

export type FieldDef = {
    type: FieldType
    operators: string[]
}

export type AggregateDef = {
    type: FieldType
    operators: string[]
    supports_where: boolean
}

export type ObjectDef = {
    fields: Record<string, FieldDef>
    aggregates?: Record<string, AggregateDef>
}

export type ConditionsSchema = {
    operators: {
        comparison: string[]
        set: string[]
        unary: string[]
    }
    objects: Record<string, ObjectDef>
}

export type SelectOption = {
    id: string
    label: string
}

export type WhereClause = {
    field: string
    operator: string
    value: string | number | null
}

export type ConditionState = {
    object: string | null
    field: string | null
    isAggregate: boolean
    operator: string
    value: string | number | null
}

export const DEFAULT_CONDITION: ConditionState = {
    object: null,
    field: null,
    isAggregate: false,
    operator: '',
    value: null,
}
