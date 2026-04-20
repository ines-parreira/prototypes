import { CheckBoxField } from '@gorgias/axiom'

import type { ConditionItem, ConditionsFormValue } from './types'
import { isSameCondition } from './types'

export function ConditionCheckBoxField({
    condition,
    label,
    selectedConditions,
    isAtLimit,
    onToggle,
}: {
    condition: ConditionItem
    label: string
    selectedConditions: ConditionsFormValue
    isAtLimit: boolean
    onToggle: (item: ConditionItem) => void
}) {
    const isSelected = selectedConditions.some((c) =>
        isSameCondition(c, condition),
    )

    return (
        <CheckBoxField
            label={label}
            value={isSelected}
            onChange={() => onToggle(condition)}
            isDisabled={isAtLimit && !isSelected}
        />
    )
}
