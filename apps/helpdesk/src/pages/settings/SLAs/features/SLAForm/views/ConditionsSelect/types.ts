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

export function isConditionDisabled(
    condition: ConditionItem,
    selectedConditions: ConditionsFormValue,
    maxSelections?: number,
): boolean {
    if (selectedConditions.some((c) => isSameCondition(c, condition))) {
        return false
    }
    if (
        maxSelections !== undefined &&
        selectedConditions.length >= maxSelections
    ) {
        return true
    }
    if (condition.category === 'ticket_fields') {
        return selectedConditions.some(
            (c) =>
                c.category === 'ticket_fields' &&
                c.fieldId === condition.fieldId,
        )
    }
    return false
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
