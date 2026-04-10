import { Box, ListItem, SelectField } from '@gorgias/axiom'

import type { SelectOption } from '../../types/conditionField'

export const ConditionInlineSelect = ({
    items,
    selectedId,
    onSelect,
    placeholder,
    ariaLabel,
}: {
    items: SelectOption[]
    selectedId: string | null
    onSelect: (id: string) => void
    placeholder?: string
    ariaLabel: string
}) => {
    const selectedItem = items.find((item) => item.id === selectedId) ?? null

    return (
        <Box width={160}>
            <SelectField
                aria-label={ariaLabel}
                placement="bottom left"
                placeholder={placeholder ?? 'Select'}
                items={items}
                value={selectedItem ?? undefined}
                onChange={(item) => {
                    if (item) onSelect(item.id)
                }}
            >
                {(item: SelectOption) => (
                    <ListItem id={item.id} label={item.label} />
                )}
            </SelectField>
        </Box>
    )
}
