import { useState } from 'react'

import { Box } from '@gorgias/axiom'

import { AddConditionLink } from '../AddConditionLink'
import { ConditionModeDropdown } from '../ConditionModeDropdown'
import { ConditionRow } from '../ConditionRow'
import { ConditionVariablePicker } from '../ConditionVariablePicker'
import { LogicConnector } from '../LogicConnector'
import type {
    Condition,
    ConditionField,
    ConditionFieldCategory,
    ConditionOperator,
    ConditionValueOption,
    LogicOperator,
} from '../types'

type Props = {
    conditions: Condition[]
    logicOperator: LogicOperator
    fields: ConditionField[]
    categories?: ConditionFieldCategory[]
    getOperators: (fieldId: string) => ConditionOperator[]
    getValueOptions?: (
        condition: Condition,
    ) => ConditionValueOption[] | undefined
    onConditionsChange: (next: Condition[]) => void
    onLogicChange: (next: LogicOperator) => void
    /** Used for `aria-live` announcement when conditions are added or removed. */
    countLabel?: (count: number) => string
}

const DEFAULT_COUNT_LABEL = (count: number) =>
    `${count} ${count === 1 ? 'condition' : 'conditions'}`

const makeBlankCondition = (
    fieldId: string,
    operatorId: string,
): Condition => ({
    id: `condition-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    field: fieldId,
    operator: operatorId,
    value: '',
})

export const ConditionBuilder = ({
    conditions,
    logicOperator,
    fields,
    categories,
    getOperators,
    getValueOptions,
    onConditionsChange,
    onLogicChange,
    countLabel = DEFAULT_COUNT_LABEL,
}: Props) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    const updateCondition = (next: Condition) => {
        onConditionsChange(
            conditions.map((condition) =>
                condition.id === next.id ? next : condition,
            ),
        )
    }

    const removeCondition = (id: string) => {
        onConditionsChange(
            conditions.filter((condition) => condition.id !== id),
        )
    }

    const addConditionFromField = (field: ConditionField) => {
        const operators = getOperators(field.id)
        if (operators.length === 0) return
        onConditionsChange([
            ...conditions,
            makeBlankCondition(field.id, operators[0].id),
        ])
    }

    const showRows = logicOperator !== 'none'
    const connector = logicOperator === 'all' ? 'all' : 'any'

    return (
        <Box flexDirection="column" gap="sm">
            <ConditionModeDropdown
                value={logicOperator}
                onChange={onLogicChange}
            />
            {showRows && (
                <Box flexDirection="column" gap="xs">
                    <span
                        aria-live="polite"
                        style={{
                            position: 'absolute',
                            width: '1px',
                            height: '1px',
                            overflow: 'hidden',
                            clip: 'rect(0 0 0 0)',
                        }}
                    >
                        {countLabel(conditions.length)}
                    </span>
                    {conditions.map((condition, index) => (
                        <Box key={condition.id} flexDirection="column" gap="xs">
                            <ConditionRow
                                condition={condition}
                                fields={fields}
                                operators={getOperators(condition.field)}
                                valueOptions={getValueOptions?.(condition)}
                                onChange={updateCondition}
                                onRemove={() => removeCondition(condition.id)}
                                canRemove={conditions.length > 0}
                            />
                            {index < conditions.length - 1 && (
                                <LogicConnector operator={connector} />
                            )}
                        </Box>
                    ))}
                    <Box>
                        <ConditionVariablePicker
                            fields={fields}
                            categories={categories}
                            isOpen={isPickerOpen}
                            onOpenChange={setIsPickerOpen}
                            onSelect={addConditionFromField}
                            trigger={
                                <AddConditionLink
                                    onClick={() => setIsPickerOpen(true)}
                                />
                            }
                        />
                    </Box>
                </Box>
            )}
        </Box>
    )
}
