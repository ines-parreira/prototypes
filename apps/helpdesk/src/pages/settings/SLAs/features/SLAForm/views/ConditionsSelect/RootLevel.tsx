import { Box, Icon, Text } from '@gorgias/axiom'
import type { Tag } from '@gorgias/helpdesk-queries'

import { getValueLabel } from 'custom-fields/helpers/getValueLabels'
import type { CustomField } from 'custom-fields/types'

import { ConditionCheckBoxField } from './ConditionCheckBoxField'
import { LevelEmptyState } from './LevelStates'
import type {
    ConditionItem,
    ConditionsFormValue,
    DrilldownLevel,
} from './types'
import { makeConditionItem } from './types'

import css from './ConditionsPopoverContent.less'

const ROOT_CATEGORIES = [
    { label: 'Tags', level: { type: 'tags' } as DrilldownLevel },
    {
        label: 'Ticket fields',
        level: { type: 'ticket_fields' } as DrilldownLevel,
    },
]

function RootSearchGroup({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <Box
            flexDirection="column"
            padding="xs"
            gap="xxxs"
            className={css.searchGroup}
        >
            <Text size="sm" color="content-neutral-secondary" variant="medium">
                {label}
            </Text>
            {children}
        </Box>
    )
}

export function RootLevel({
    searchQuery,
    tags,
    dropdownFields,
    getFieldChoices,
    selectedConditions,
    isLoadingTags,
    isLoadingFields,
    maxSelections,
    onLoadMoreTags,
    shouldLoadMoreTags,
    onNavigate,
    onToggleCondition,
}: {
    searchQuery: string
    tags: Tag[]
    dropdownFields: CustomField[]
    getFieldChoices: (fieldId: number) => string[]
    selectedConditions: ConditionsFormValue
    isLoadingTags: boolean
    isLoadingFields: boolean
    maxSelections?: number
    onLoadMoreTags: () => Promise<unknown>
    shouldLoadMoreTags: boolean
    onNavigate: (level: DrilldownLevel) => void
    onToggleCondition: (item: ConditionItem) => void
}) {
    if (!searchQuery) {
        return (
            <>
                {ROOT_CATEGORIES.map((cat) => (
                    <button
                        key={cat.label}
                        type="button"
                        className={css.drilldownRow}
                        onClick={() => onNavigate(cat.level)}
                    >
                        <Text size="md">{cat.label}</Text>
                        <Icon name="arrow-chevron-right" size="sm" />
                    </button>
                ))}
            </>
        )
    }

    const query = searchQuery.toLowerCase()

    const matchedTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(query),
    )

    const matchedFieldValues = dropdownFields.flatMap((field) => {
        const choices = getFieldChoices(field.id)
        return choices
            .filter((choice) => choice.toLowerCase().includes(query))
            .map((choice) => ({ field, choice }))
    })

    const isLoading = isLoadingTags || isLoadingFields
    const hasNoResults =
        matchedTags.length === 0 && matchedFieldValues.length === 0

    if (!isLoading && hasNoResults) {
        return <LevelEmptyState />
    }

    return (
        <Box flexDirection="column">
            {(isLoadingTags || matchedTags.length > 0) && (
                <RootSearchGroup label="Tags">
                    {isLoadingTags ? (
                        <Text color="content-neutral-secondary">
                            Loading...
                        </Text>
                    ) : (
                        <>
                            {matchedTags.map((tag) => (
                                <ConditionCheckBoxField
                                    key={tag.id}
                                    condition={makeConditionItem(
                                        'tags',
                                        tag.id,
                                        tag.name,
                                        tag.name,
                                    )}
                                    label={tag.name}
                                    selectedConditions={selectedConditions}
                                    maxSelections={maxSelections}
                                    onToggle={onToggleCondition}
                                />
                            ))}
                            {shouldLoadMoreTags && (
                                <button
                                    type="button"
                                    className={css.loadMoreButton}
                                    onClick={() => void onLoadMoreTags()}
                                >
                                    <Text
                                        size="sm"
                                        color="content-accent-default"
                                    >
                                        Load more
                                    </Text>
                                </button>
                            )}
                        </>
                    )}
                </RootSearchGroup>
            )}
            {(isLoadingFields || matchedFieldValues.length > 0) && (
                <RootSearchGroup label="Ticket fields">
                    {isLoadingFields ? (
                        <Text color="content-neutral-secondary">
                            Loading...
                        </Text>
                    ) : (
                        matchedFieldValues.map(({ field, choice }) => {
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
                                    maxSelections={maxSelections}
                                    onToggle={onToggleCondition}
                                />
                            )
                        })
                    )}
                </RootSearchGroup>
            )}
        </Box>
    )
}
