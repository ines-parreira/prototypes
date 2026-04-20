import type { Tag } from '@gorgias/helpdesk-queries'
import type { SLAPolicyFilter } from '@gorgias/helpdesk-types'
import { SlaPolicyFilterOperation } from '@gorgias/helpdesk-types'

import { getValueLabel } from 'custom-fields/helpers/getValueLabels'
import type { CustomField } from 'custom-fields/types'

import type { ConditionItem } from '../views/ConditionsSelect/types'

const TAGS_FIELD = 'tags.name'
const CUSTOM_FIELD_PATTERN = /^custom_fields\[(\d+)]\.value$/

function toCustomFieldKey(fieldId: number): string {
    return `custom_fields[${fieldId}].value`
}

export function mapConditionsToFilters(
    conditions: ConditionItem[],
): SLAPolicyFilter[] {
    if (conditions.length === 0) return []

    const filters: SLAPolicyFilter[] = []

    const tagValues = conditions
        .filter((c) => c.category === 'tags')
        .map((c) => c.value)

    if (tagValues.length > 0) {
        filters.push({
            field: TAGS_FIELD,
            operator: SlaPolicyFilterOperation.ContainsAll,
            value: tagValues,
        })
    }

    const fieldGroups = new Map<number, string[]>()
    for (const c of conditions) {
        if (c.category !== 'ticket_fields') continue
        const existing = fieldGroups.get(c.fieldId) ?? []
        existing.push(c.value)
        fieldGroups.set(c.fieldId, existing)
    }

    for (const [fieldId, values] of fieldGroups) {
        filters.push({
            field: toCustomFieldKey(fieldId),
            operator: SlaPolicyFilterOperation.ContainsAll,
            value: values,
        })
    }

    return filters
}

export function mapFiltersToConditions(
    filters: SLAPolicyFilter[],
    lookups: { tags: Tag[]; fields: CustomField[] },
): ConditionItem[] {
    const conditions: ConditionItem[] = []

    for (const filter of filters) {
        if (filter.field === TAGS_FIELD) {
            const values = Array.isArray(filter.value)
                ? filter.value
                : [filter.value]

            for (const tagName of values) {
                if (typeof tagName !== 'string') continue
                const tag = lookups.tags.find((t) => t.name === tagName)
                conditions.push({
                    category: 'tags',
                    fieldId: tag?.id ?? 0,
                    value: tagName,
                    displayLabel: tagName,
                })
            }
            continue
        }

        const match = CUSTOM_FIELD_PATTERN.exec(filter.field)
        if (!match) continue

        const fieldId = Number(match[1])
        const field = lookups.fields.find((f) => f.id === fieldId)
        const fieldLabel = field?.label ?? `Field #${fieldId}`

        const values = Array.isArray(filter.value)
            ? filter.value
            : [filter.value]

        for (const val of values) {
            if (typeof val !== 'string') continue
            conditions.push({
                category: 'ticket_fields',
                fieldId,
                value: val,
                displayLabel: `${fieldLabel} / ${getValueLabel(val)}`,
            })
        }
    }

    return conditions
}
