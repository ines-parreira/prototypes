import type { FieldType } from '@gorgias/customer-segmentation-types'

import type {
    AggregateDef,
    ConditionsSchema,
    FieldDef,
    SelectOption,
} from 'AIJourney/types/conditionField'

export const OPERATOR_LABELS: Record<string, string> = {
    eq: 'is',
    neq: 'is not',
    gt: 'greater than',
    gte: 'at least',
    lt: 'less than',
    lte: 'at most',
    contains: 'contains',
    containsAny: 'contains any of',
    containsAll: 'contains all of',
    notContainsAny: 'contains none of',
    isEmpty: 'is empty',
    isNotEmpty: 'is not empty',
}

export const DATETIME_PRESETS: SelectOption[] = [
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
    { id: '365d', label: '365 days' },
]

export function toLabel(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildSelectId(
    object: string,
    field: string,
    isAggregate: boolean,
): string {
    return `${object}:${isAggregate ? 'aggregate' : 'field'}:${field}`
}

export function parseSelectId(
    id: string,
): { object: string; field: string; isAggregate: boolean } | null {
    const parts = id.split(':')
    if (parts.length !== 3) return null
    const [object, type, field] = parts
    return { object, field, isAggregate: type === 'aggregate' }
}

export function getFieldDef(
    schema: ConditionsSchema,
    object: string,
    field: string,
    isAggregate: boolean,
): FieldDef | AggregateDef | null {
    const obj = schema.objects[object]
    if (!obj) return null
    return isAggregate
        ? (obj.aggregates?.[field] ?? null)
        : (obj.fields[field] ?? null)
}

const CONDITION_ALLOWLIST = [
    {
        sectionId: 'shopper',
        sectionName: 'Shopper characteristics',
        items: [
            { field: 'sms_state', label: 'SMS subscription status' },
            { field: 'sms_state_date', label: 'SMS subscription date' },
            { field: 'tags', label: 'Shopify customer tag' },
            { field: 'address_state_code', label: 'State' },
        ],
    },
    {
        sectionId: 'orders',
        sectionName: 'Shopper activities',
        items: [
            { field: 'count', label: 'Number of orders' },
            { field: 'total_amount', label: 'Total amount spent' },
        ],
    },
] as const

export function buildSections(schema: ConditionsSchema) {
    return CONDITION_ALLOWLIST.flatMap(({ sectionId, sectionName, items }) => {
        const objectDef = schema.objects[sectionId]
        if (!objectDef) return []
        const allowedItems = items.flatMap(({ field, label }) => {
            if (objectDef.fields[field] != null) {
                return [{ id: buildSelectId(sectionId, field, false), label }]
            }
            if (objectDef.aggregates?.[field] != null) {
                return [{ id: buildSelectId(sectionId, field, true), label }]
            }
            return []
        })
        if (allowedItems.length === 0) return []
        return [{ id: sectionId, name: sectionName, items: allowedItems }]
    })
}

export function getOperatorOptions(
    fieldDef: FieldDef | AggregateDef,
): SelectOption[] {
    return fieldDef.operators.map((op) => ({
        id: op,
        label: OPERATOR_LABELS[op] ?? op,
    }))
}

export function defaultValueForType(type: FieldType): string | number | null {
    return type === 'datetime' ? '30d' : null
}
