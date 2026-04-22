import { CheckBoxField } from '@gorgias/axiom'

import type { ConditionItem, ConditionsFormValue } from './types'
import { isConditionDisabled, isSameCondition } from './types'

export function ConditionCheckBoxField({
    condition,
    label,
    selectedConditions,
    maxSelections,
    selectedCaption,
    onToggle,
}: {
    condition: ConditionItem
    label: string
    selectedConditions: ConditionsFormValue
    maxSelections?: number
    selectedCaption?: string
    onToggle: (item: ConditionItem) => void
}) {
    const isSelected = selectedConditions.some((c) =>
        isSameCondition(c, condition),
    )

    return (
        <CheckBoxField
            label={label}
            caption={isSelected ? selectedCaption : undefined}
            value={isSelected}
            onChange={() => onToggle(condition)}
            isDisabled={isConditionDisabled(
                condition,
                selectedConditions,
                maxSelections,
            )}
        />
    )
}
