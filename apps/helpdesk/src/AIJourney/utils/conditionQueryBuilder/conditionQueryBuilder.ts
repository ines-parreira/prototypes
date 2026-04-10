import type { FieldType } from '@gorgias/customer-segmentation-types'

import type {
    ConditionsSchema,
    ConditionState,
} from 'AIJourney/types/conditionField'
import { getFieldDef } from 'AIJourney/utils/conditionField/conditionField'

function formatFieldValue(
    value: string | number,
    type: FieldType,
    operator: string,
): string {
    if (type === 'number') return String(value)
    if (operator.toLowerCase().includes('contains')) {
        const items = String(value)
            .split(',')
            .map((v) => `'${v.trim()}'`)
        return `[${items.join(', ')}]`
    }
    return `'${value}'`
}

function buildConditionQuery(
    condition: ConditionState,
    schema: ConditionsSchema,
): string | null {
    if (!condition.object || !condition.field) return null

    const fieldDef = getFieldDef(
        schema,
        condition.object,
        condition.field,
        condition.isAggregate,
    )
    if (!fieldDef) return null

    const { operator, value } = condition
    const dslRef = `${condition.object}.${condition.field}`
    const isUnary = schema.operators.unary.includes(operator)

    if (isUnary) {
        return `${operator}(${dslRef})`
    }

    if (value === null || value === undefined || value === '') return null

    const formattedValue = formatFieldValue(value, fieldDef.type, operator)
    return `${operator}(${dslRef}, ${formattedValue})`
}

export function buildFullQuery(
    conditions: ConditionState[],
    schema: ConditionsSchema,
): string {
    const query = conditions
        .map((c) => buildConditionQuery(c, schema))
        .filter(Boolean)
        .join(' && ')
    return query
}
