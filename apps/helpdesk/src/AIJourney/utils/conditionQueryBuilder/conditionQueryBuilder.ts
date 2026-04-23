import type { FieldType } from '@gorgias/customer-segmentation-types'

import type {
    AggregateDef,
    ConditionsSchema,
    ConditionState,
    PurchaseDateClause,
    WhereClause,
} from 'AIJourney/types/conditionField'
import { DEFAULT_CONDITION } from 'AIJourney/types/conditionField'
import {
    defaultValueForType,
    getFieldDef,
    isExistenceCondition,
    isExistenceObject,
} from 'AIJourney/utils/conditionField/conditionField'

function splitContainsValue(value: string): string[] {
    return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '')
}

function escapeStr(v: string): string {
    return v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function unescapeStr(v: string): string {
    return v.replace(/\\'/g, "'").replace(/\\\\/g, '\\')
}

function formatFieldValue(
    value: string | number | string[],
    type: FieldType,
    operator: string,
): string {
    if (Array.isArray(value)) {
        return `[${value.map((v) => `'${escapeStr(v)}'`).join(', ')}]`
    }
    if (type === 'number') return String(value)
    if (operator.toLowerCase().includes('contains')) {
        const items = splitContainsValue(String(value)).map(
            (v) => `'${escapeStr(v)}'`,
        )
        return `[${items.join(', ')}]`
    }
    return `'${escapeStr(String(value))}'`
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

    if (isExistenceCondition(condition.object, condition.field)) {
        const wc = condition.whereClause
        if (!wc?.field || !wc.operator) return null
        const whereFieldDef = schema.objects[condition.object]?.fields[wc.field]
        if (!whereFieldDef) return null
        const isWcUnary = schema.operators.unary.includes(wc.operator)
        if (isWcUnary) {
            return `${wc.operator}(${condition.object}.${wc.field})`
        }
        if (
            wc.value === null ||
            wc.value === undefined ||
            wc.value === '' ||
            (Array.isArray(wc.value) && wc.value.length === 0)
        ) {
            return null
        }
        return `${wc.operator}(${condition.object}.${wc.field}, ${formatFieldValue(wc.value, whereFieldDef.type, wc.operator)})`
    }

    const dslRef = `${condition.object}.${condition.field}`
    const isUnary = schema.operators.unary.includes(operator)

    if (isUnary) {
        return condition.isAggregate
            ? `${operator}(${dslRef}())`
            : `${operator}(${dslRef})`
    }

    if (value === null || value === undefined || value === '') return null
    if (Array.isArray(value) && value.length === 0) return null
    if (
        typeof value === 'string' &&
        operator.toLowerCase().includes('contains') &&
        splitContainsValue(value).length === 0
    )
        return null

    if (condition.isAggregate) {
        const aggDef = fieldDef as AggregateDef
        let wherePart = ''

        if (aggDef.supports_where && condition.whereClause) {
            const wc = condition.whereClause
            const whereFieldDef =
                wc.field && condition.object
                    ? schema.objects[condition.object]?.fields[wc.field]
                    : null
            const isWhereUnary = schema.operators.unary.includes(wc.operator)

            if (whereFieldDef && wc.operator) {
                if (isWhereUnary) {
                    wherePart = `${wc.operator}(${wc.field})`
                } else if (wc.value !== null && wc.value !== '') {
                    const whereVal = formatFieldValue(
                        wc.value,
                        whereFieldDef.type,
                        operator,
                    )
                    wherePart = `${wc.operator}(${wc.field}, ${whereVal})`
                }
            }
        }

        let purchaseDatePart = ''
        if (condition.purchaseDateClause) {
            const pdc = condition.purchaseDateClause
            const isUnaryPdc = schema.operators.unary.includes(pdc.operator)
            if (isUnaryPdc && pdc.operator !== 'isNotEmpty') {
                purchaseDatePart = `${pdc.operator}(purchase_date)`
            } else if (!isUnaryPdc && pdc.value) {
                purchaseDatePart = `${pdc.operator}(purchase_date, '${pdc.value}')`
            }
        }

        const innerClause = [wherePart, purchaseDatePart]
            .filter(Boolean)
            .join(' && ')
        const formattedValue = formatFieldValue(value, fieldDef.type, operator)
        return `${operator}(${dslRef}(${innerClause}), ${formattedValue})`
    }

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
    const strMatch = raw.match(/^'((?:[^'\\]|\\.)*)'$/)
    if (strMatch) return unescapeStr(strMatch[1])
    const arrMatch = raw.match(/^\[(.+)\]$/)
    if (arrMatch) {
        const values = arrMatch[1].match(/'((?:[^'\\]|\\.)*)'/g)
        if (values) {
            const parsed = values.map((s) => unescapeStr(s.slice(1, -1)))
            return parsed.length === 1 ? parsed[0] : parsed
        }
    }
    return null
}

function parseAggregateInner(
    innerContent: string,
    object: string,
    field: string,
    schema: ConditionsSchema,
): {
    whereClause: WhereClause | null
    purchaseDateClause: PurchaseDateClause | null
} {
    if (!innerContent.trim()) {
        const aggDef = schema.objects[object]?.aggregates?.[field] as
            | AggregateDef
            | undefined
        if (!aggDef?.supports_where) {
            return { whereClause: null, purchaseDateClause: null }
        }
        const firstField =
            Object.keys(schema.objects[object]?.fields ?? {})[0] ?? ''
        const firstFieldDef = firstField
            ? schema.objects[object].fields[firstField]
            : null
        return {
            whereClause: {
                field: firstField,
                operator: firstFieldDef?.operators[0] ?? '',
                value: defaultValueForType(firstFieldDef?.type ?? 'string'),
            },
            purchaseDateClause: null,
        }
    }

    const parts = splitTopLevel(innerContent, ' && ')
    let whereClause: WhereClause | null = null
    let purchaseDateClause: PurchaseDateClause | null = null

    for (const part of parts) {
        const outerMatch = part.trim().match(/^(\w+)\((.+)\)$/)
        if (!outerMatch) continue
        const [, partOperator, partInner] = outerMatch
        const partArgs = splitTopLevel(partInner, ', ')
        const firstArg = partArgs[0]

        if (firstArg === 'purchase_date') {
            purchaseDateClause = {
                operator: partOperator,
                value:
                    partArgs.length > 1
                        ? (parseValue(partArgs[1]) as string | null)
                        : null,
            } as PurchaseDateClause
        } else {
            whereClause = {
                field: firstArg,
                operator: partOperator,
                value: partArgs.length > 1 ? parseValue(partArgs[1]) : null,
            }
        }
    }

    return { whereClause, purchaseDateClause }
}

function parseConditionStr(
    condStr: string,
    schema: ConditionsSchema,
): ConditionState | null {
    const outerMatch = condStr.match(/^(\w+)\((.+)\)$/)
    if (!outerMatch) return null
    const [, operator, inner] = outerMatch

    const args = splitTopLevel(inner, ', ')
    const dslRef = args[0]

    const aggMatch = dslRef.match(/^(\w+)\.(\w+)\((.*)\)$/)
    const fieldMatch = dslRef.match(/^(\w+)\.(\w+)$/)

    if (aggMatch) {
        const [, object, field, whereContent] = aggMatch
        const { whereClause, purchaseDateClause } = parseAggregateInner(
            whereContent,
            object,
            field,
            schema,
        )
        return {
            object,
            field,
            isAggregate: true,
            operator,
            value: args.length > 1 ? parseValue(args[1]) : null,
            whereClause,
            purchaseDateClause,
            isWhereVisible: whereClause !== null,
        }
    }

    if (fieldMatch) {
        const [, object, field] = fieldMatch
        // eq(last_order.product_variant_ids, [...]) — existence with where clause
        if (isExistenceObject(object)) {
            return {
                object,
                field: object,
                isAggregate: false,
                operator: 'isNotEmpty',
                value: null,
                whereClause: {
                    field,
                    operator,
                    value: args.length > 1 ? parseValue(args[1]) : null,
                },
                purchaseDateClause: null,
                isWhereVisible: true,
            }
        }
        return {
            object,
            field,
            isAggregate: false,
            operator,
            value: args.length > 1 ? parseValue(args[1]) : null,
            whereClause: null,
            purchaseDateClause: null,
            isWhereVisible: false,
        }
    }

    return null
}

function mergePurchaseDateClauses(
    conditions: ConditionState[],
): ConditionState[] {
    const result: ConditionState[] = []
    let i = 0
    while (i < conditions.length) {
        const current = conditions[i]
        const next = conditions[i + 1]
        if (
            current.isAggregate &&
            next?.field === 'purchase_date' &&
            next?.object === current.object &&
            !next.isAggregate
        ) {
            result.push({
                ...current,
                purchaseDateClause: {
                    operator: next.operator,
                    value: next.value as string | null,
                } as PurchaseDateClause,
            })
            i += 2
        } else {
            result.push(current)
            i++
        }
    }
    return result
}

export function parseConditionsQuery(
    query: string,
    schema: ConditionsSchema,
): ConditionState[] {
    if (!query.trim()) return [DEFAULT_CONDITION]
    const parsed = splitTopLevel(query, ' && ')
        .map((s) => parseConditionStr(s.trim(), schema))
        .filter((c): c is ConditionState => c !== null)
    const conditions = mergePurchaseDateClauses(parsed)
    return conditions.length > 0 ? conditions : [DEFAULT_CONDITION]
}
