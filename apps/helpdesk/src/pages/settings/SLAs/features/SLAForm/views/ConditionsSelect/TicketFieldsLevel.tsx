import { useMemo } from 'react'

import { Box, Icon, Text } from '@gorgias/axiom'

import { getValueLabel } from 'custom-fields/helpers/getValueLabels'
import type { CustomField } from 'custom-fields/types'

import { ConditionCheckBoxField } from './ConditionCheckBoxField'
import { LevelEmptyState, LevelLoadingState } from './LevelStates'
import type {
    ConditionItem,
    ConditionsFormValue,
    DrilldownLevel,
} from './types'
import { makeConditionItem } from './types'

import css from './ConditionsPopoverContent.less'

export function TicketFieldsLevel({
    fields,
    searchQuery,
    isLoading,
    getFieldChoices,
    selectedConditions,
    isAtLimit,
    onNavigate,
    onToggle,
}: {
    fields: CustomField[]
    searchQuery: string
    isLoading: boolean
    getFieldChoices: (fieldId: number) => string[]
    selectedConditions: ConditionsFormValue
    isAtLimit: boolean
    onNavigate: (level: DrilldownLevel) => void
    onToggle: (item: ConditionItem) => void
}) {
    const matchedValues = useMemo(() => {
        if (!searchQuery) return null
        const query = searchQuery.toLowerCase()
        return fields.flatMap((field) =>
            getFieldChoices(field.id)
                .filter((choice) => choice.toLowerCase().includes(query))
                .map((choice) => ({ field, choice })),
        )
    }, [fields, searchQuery, getFieldChoices])

    if (isLoading) {
        return <LevelLoadingState />
    }

    if (matchedValues) {
        if (matchedValues.length === 0) {
            return <LevelEmptyState />
        }

        return (
            <Box flexDirection="column" padding="xs" gap="xxxs">
                {matchedValues.map(({ field, choice }) => {
                    const displayLabel = `${field.label} / ${getValueLabel(choice)}`
                    return (
                        <ConditionCheckBoxField
                            key={`${field.id}-${choice}`}
                            condition={makeConditionItem(
                                'ticket_fields',
                                field.id,
                                choice,
                                displayLabel,
                            )}
                            label={displayLabel}
                            selectedConditions={selectedConditions}
                            isAtLimit={isAtLimit}
                            onToggle={onToggle}
                        />
                    )
                })}
            </Box>
        )
    }

    if (fields.length === 0) {
        return <LevelEmptyState />
    }

    return (
        <>
            {fields.map((field) => (
                <button
                    key={field.id}
                    type="button"
                    className={css.drilldownRow}
                    onClick={() =>
                        onNavigate({
                            type: 'ticket_field_values',
                            fieldId: field.id,
                            fieldLabel: field.label,
                            path: [],
                        })
                    }
                >
                    <Text size="md">{field.label}</Text>
                    <Icon name="arrow-chevron-right" size="sm" />
                </button>
            ))}
        </>
    )
}
