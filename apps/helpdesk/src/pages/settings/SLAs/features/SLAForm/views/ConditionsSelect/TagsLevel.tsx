import { Box } from '@gorgias/axiom'
import type { Tag } from '@gorgias/helpdesk-queries'

import { ConditionCheckBoxField } from './ConditionCheckBoxField'
import { LevelEmptyState, LevelLoadingState } from './LevelStates'
import type { ConditionItem, ConditionsFormValue } from './types'
import { makeConditionItem } from './types'

export function TagsLevel({
    tags,
    selectedConditions,
    isLoading,
    maxSelections,
    onToggle,
}: {
    tags: Tag[]
    selectedConditions: ConditionsFormValue
    isLoading: boolean
    maxSelections?: number
    onToggle: (item: ConditionItem) => void
}) {
    if (isLoading) {
        return <LevelLoadingState />
    }

    if (tags.length === 0) {
        return <LevelEmptyState />
    }

    return (
        <Box flexDirection="column" padding="xs" gap="xxxs">
            {tags.map((tag) => (
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
                    onToggle={onToggle}
                />
            ))}
        </Box>
    )
}
