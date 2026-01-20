import { Button, ListItem, MultiSelect } from '@gorgias/axiom'

type FilterType = 'dateRange' | 'interactionType' | 'ticketStatus'

type FilteringButtonProps = {
    onFilterSelect: (filterType: FilterType) => void
    activeFilters: Set<FilterType>
}

type FilterOption = {
    id: FilterType
    label: string
}

const FILTER_OPTIONS: FilterOption[] = [
    { id: 'dateRange', label: 'Date range' },
    { id: 'interactionType', label: 'Interaction type' },
    { id: 'ticketStatus', label: 'Ticket status' },
]

export function FilteringButton({
    onFilterSelect,
    activeFilters,
}: FilteringButtonProps) {
    // Convert active filters Set to array of FilterOption objects
    const selectedItems = FILTER_OPTIONS.filter((option) =>
        activeFilters.has(option.id),
    )

    const handleSelect = (selected: FilterOption[]) => {
        // Find newly added filters
        const newFilters = selected.filter(
            (item) => !activeFilters.has(item.id),
        )

        // Add only the new filters one by one
        newFilters.forEach((filter) => {
            onFilterSelect(filter.id)
        })
    }

    return (
        <MultiSelect
            items={FILTER_OPTIONS}
            selectedItems={selectedItems}
            onSelect={handleSelect}
            selectionBehavior="toggle"
            trigger={({ ref }) => (
                <Button
                    ref={ref}
                    slot="button"
                    variant="tertiary"
                    size="sm"
                    icon="slider-filter"
                />
            )}
        >
            {(option) => <ListItem label={option.label} />}
        </MultiSelect>
    )
}
