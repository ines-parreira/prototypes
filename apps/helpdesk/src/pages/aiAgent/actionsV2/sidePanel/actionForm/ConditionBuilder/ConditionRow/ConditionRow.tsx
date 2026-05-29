import type { ZonedDateTime } from '@internationalized/date'
import { parseAbsoluteToLocal } from '@internationalized/date'

import {
    Box,
    Button,
    DatePicker,
    ListItem,
    Select,
    Text,
    TextField,
} from '@gorgias/axiom'

import type {
    Condition,
    ConditionField,
    ConditionOperator,
    ConditionValueOption,
} from '../types'

import css from './ConditionRow.less'

const toZonedDateTime = (value: Condition['value']): ZonedDateTime | null => {
    if (typeof value !== 'string' || value === '') return null
    try {
        return parseAbsoluteToLocal(value)
    } catch {
        return null
    }
}

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
})

type Props = {
    condition: Condition
    fields: ConditionField[]
    operators: ConditionOperator[]
    valueOptions?: ConditionValueOption[]
    onChange: (next: Condition) => void
    onRemove: () => void
    canRemove?: boolean
    deleteAriaLabel?: string
}

export const ConditionRow = ({
    condition,
    fields,
    operators,
    valueOptions,
    onChange,
    onRemove,
    canRemove = true,
    deleteAriaLabel = 'Remove condition',
}: Props) => {
    const selectedField = fields.find((field) => field.id === condition.field)
    const selectedOperator = operators.find(
        (operator) => operator.id === condition.operator,
    )
    const selectedValueOption = valueOptions?.find(
        (option) => option.value === condition.value,
    )

    const hasValueOptions = !!valueOptions && valueOptions.length > 0
    const isValueless = !!valueOptions && valueOptions.length === 0
    const isDateField = !valueOptions && selectedField?.type === 'date'

    return (
        <Box flexDirection="row" alignItems="center" gap="xs" flexWrap="wrap">
            <span className={css.fieldLabel} aria-label="Field">
                <Text size="sm" variant="medium">
                    {selectedField?.label ?? condition.field}
                </Text>
            </span>
            <Select
                items={operators}
                selectedItem={selectedOperator}
                onSelect={(next: ConditionOperator) =>
                    onChange({ ...condition, operator: next.id })
                }
                aria-label="Operator"
                trigger={({ selectedText, isOpen }) => (
                    <Button
                        variant="secondary"
                        size="sm"
                        trailingSlot={
                            isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'
                        }
                    >
                        {selectedText || 'Operator'}
                    </Button>
                )}
            >
                {(operator: ConditionOperator) => (
                    <ListItem
                        key={operator.id}
                        id={operator.id}
                        label={operator.label}
                    />
                )}
            </Select>
            {isValueless && null}
            {hasValueOptions && (
                <Select
                    items={valueOptions}
                    keyName="value"
                    selectedItem={selectedValueOption}
                    onSelect={(next: ConditionValueOption) =>
                        onChange({ ...condition, value: next.value })
                    }
                    aria-label="Value"
                    trigger={({ selectedText, isOpen }) => (
                        <Button
                            variant="secondary"
                            size="sm"
                            trailingSlot={
                                isOpen
                                    ? 'arrow-chevron-up'
                                    : 'arrow-chevron-down'
                            }
                        >
                            {selectedText || 'Value'}
                        </Button>
                    )}
                >
                    {(option: ConditionValueOption) => (
                        <ListItem
                            key={option.value}
                            id={option.value}
                            label={option.label}
                        />
                    )}
                </Select>
            )}
            {isDateField && (
                <span className={css.datePickerSlot}>
                    <DatePicker
                        aria-label="Value"
                        placeholder="Choose a date"
                        value={toZonedDateTime(condition.value)}
                        onChange={(next) =>
                            onChange({
                                ...condition,
                                value: next ? next.toDate().toISOString() : '',
                            })
                        }
                        trigger={({ state, timeZone }) => {
                            const date = state.value?.toDate?.(timeZone)
                            return (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    trailingSlot="arrow-chevron-down"
                                >
                                    {date
                                        ? DATE_FORMATTER.format(date)
                                        : 'Choose a date'}
                                </Button>
                            )
                        }}
                    />
                </span>
            )}
            {!isValueless && !hasValueOptions && !isDateField && (
                <Box flexGrow={1}>
                    <TextField
                        aria-label="Value"
                        value={String(condition.value ?? '')}
                        onChange={(next: string) =>
                            onChange({ ...condition, value: next })
                        }
                    />
                </Box>
            )}
            <Box flexGrow={1} />
            <Button
                as="button"
                variant="tertiary"
                size="sm"
                intent="destructive"
                icon="close"
                onClick={onRemove}
                isDisabled={!canRemove}
                aria-label={deleteAriaLabel}
            />
        </Box>
    )
}
