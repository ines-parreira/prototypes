export type ConditionItem = {
    category: 'tags' | 'ticket_fields'
    fieldId: number
    value: string
    displayLabel: string
}

export type ConditionsFormValue = ConditionItem[]

export function isSameCondition(a: ConditionItem, b: ConditionItem): boolean {
    if (a.category !== b.category || a.value !== b.value) return false
    if (a.category === 'tags') return true
    return a.fieldId === b.fieldId
}

export type DrilldownLevel =
    | { type: 'root' }
    | { type: 'tags' }
    | { type: 'ticket_fields' }
    | {
          type: 'ticket_field_values'
          fieldId: number
          fieldLabel: string
          path: string[]
      }

export function getShortLabel(item: ConditionItem): string {
    if (item.category === 'tags') return item.displayLabel
    const parts = item.value.split('::')
    return parts[parts.length - 1]
}

export function makeConditionItem(
    category: ConditionItem['category'],
    fieldId: number,
    value: string,
    displayLabel: string,
): ConditionItem {
    return { category, fieldId, value, displayLabel }
}
