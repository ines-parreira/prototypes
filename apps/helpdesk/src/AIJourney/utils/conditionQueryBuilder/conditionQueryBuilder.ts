import type { FieldType } from '@gorgias/customer-segmentation-types'

import type {
    ConditionsSchema,
    ConditionState,
} from 'AIJourney/types/conditionField'
import { DEFAULT_CONDITION } from 'AIJourney/types/conditionField'
import { getFieldDef } from 'AIJourney/utils/conditionField/conditionField'

function splitContainsValue(value: string): string[] {
    return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '')
}

function formatFieldValue(
    value: string | number | string[],
    type: FieldType,
    operator: string,
): string {
    if (Array.isArray(value)) {
        return `[${value.map((v) => `'${v}'`).join(', ')}]`
    }
    if (type === 'number') return String(value)
    if (operator.toLowerCase().includes('contains')) {
        const items = splitContainsValue(String(value)).map((v) => `'${v}'`)
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
    if (Array.isArray(value) && value.length === 0) return null
    if (
        typeof value === 'string' &&
        operator.toLowerCase().includes('contains') &&
        splitContainsValue(value).length === 0
    )
        return null

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

function splitTopLevel(str: string, sep: string): string[] {
    const parts: string[] = []
    let depth = 0
    let start = 0
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '(' || str[i] === '[') depth++
        else if (str[i] === ')' || str[i] === ']') depth--
        else if (depth === 0 && str.slice(i, i + sep.length) === sep) {
            parts.push(str.slice(start, i))
            start = i + sep.length
            i += sep.length - 1
        }
    }
    parts.push(str.slice(start))
    return parts
}

function parseValue(raw: string): string | number | string[] | null {
    if (!raw) return null
    const numMatch = raw.match(/^-?\d+(\.\d+)?$/)
    if (numMatch) return parseFloat(raw)
    const strMatch = raw.match(/^'([^']*)'$/)
    if (strMatch) return strMatch[1]
    const arrMatch = raw.match(/^\[(.+)\]$/)
    if (arrMatch) {
        const values = arrMatch[1].match(/'([^']*)'/g)
        if (values) {
            const parsed = values.map((s) => s.slice(1, -1))
            return parsed.length === 1 ? parsed[0] : parsed
        }
    }
    return null
}

function parseConditionStr(condStr: string): ConditionState | null {
    const outerMatch = condStr.match(/^(\w+)\((.+)\)$/)
    if (!outerMatch) return null
    const [, operator, inner] = outerMatch

    const args = splitTopLevel(inner, ', ')
    const dslRef = args[0]

    const aggMatch = dslRef.match(/^(\w+)\.(\w+)\((.*)\)$/)
    const fieldMatch = dslRef.match(/^(\w+)\.(\w+)$/)

    if (aggMatch) {
        const [, object, field] = aggMatch
        return {
            object,
            field,
            isAggregate: true,
            operator,
            value: args.length > 1 ? parseValue(args[1]) : null,
        }
    }

    if (fieldMatch) {
        const [, object, field] = fieldMatch
        return {
            object,
            field,
            isAggregate: false,
            operator,
            value: args.length > 1 ? parseValue(args[1]) : null,
        }
    }

    return null
}

export function parseConditionsQuery(query: string): ConditionState[] {
    if (!query.trim()) return [DEFAULT_CONDITION]
    const conditions = splitTopLevel(query, ' && ')
        .map((s) => parseConditionStr(s.trim()))
        .filter((c): c is ConditionState => c !== null)
    return conditions.length > 0 ? conditions : [DEFAULT_CONDITION]
}
