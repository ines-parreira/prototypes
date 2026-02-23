import { Button, Icon, ListItem, MultiSelect } from '@gorgias/axiom'

import type { SortOption } from '../hooks/useTimelineData'

type SortingButtonProps = {
    sortOption: SortOption
    onSortChange: (option: SortOption) => void
}

type SortField = 'updated' | 'created'
type SortDirection = 'asc' | 'desc'

const SORT_FIELDS: Array<{ field: SortField; label: string }> = [
    { field: 'updated', label: 'Last updated' },
    { field: 'created', label: 'Created' },
]

// Helper to parse current sort option
function parseSortOption(sortOption: SortOption): {
    field: SortField
    direction: SortDirection
} {
    if (sortOption.startsWith('updated-')) {
        return {
            field: 'updated',
            direction: sortOption.endsWith('desc') ? 'desc' : 'asc',
        }
    }
    return {
        field: 'created',
        direction: sortOption.endsWith('desc') ? 'desc' : 'asc',
    }
}

// Helper to build sort option from field and direction
function buildSortOption(
    field: SortField,
    direction: SortDirection,
): SortOption {
    return `${field}-${direction}` as SortOption
}

export function SortingButton({
    sortOption,
    onSortChange,
}: SortingButtonProps) {
    const currentSort = parseSortOption(sortOption)

    const handleSortClick = (field: SortField) => {
        if (currentSort.field === field) {
            // Toggle direction if clicking the same field
            const newDirection =
                currentSort.direction === 'desc' ? 'asc' : 'desc'
            onSortChange(buildSortOption(field, newDirection))
        } else {
            // Switch to new field with default descending direction
            onSortChange(buildSortOption(field, 'desc'))
        }
    }

    const items = SORT_FIELDS.map((sortField) => ({
        id: sortField.field,
        label: sortField.label,
    }))

    const selectedItems = items.filter((item) => item.id === currentSort.field)

    return (
        <MultiSelect
            items={items}
            selectedItems={selectedItems}
            onSelect={(selected) => {
                // Handle single selection - take the first selected item
                if (selected.length > 0) {
                    handleSortClick(selected[0].id as SortField)
                }
            }}
            selectionBehavior="replace"
            trigger={() => (
                <Button variant="tertiary" size="sm" icon="arrow-down-up" />
            )}
        >
            {(item) => {
                const isSelected = currentSort.field === item.id
                const direction = isSelected ? currentSort.direction : 'desc'
                const iconName =
                    direction === 'desc' ? 'arrow-down' : 'arrow-up'

                return (
                    <ListItem
                        label={item.label}
                        trailingSlot={
                            isSelected ? <Icon name={iconName} /> : null
                        }
                    />
                )
            }}
        </MultiSelect>
    )
}
