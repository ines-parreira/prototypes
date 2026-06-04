import { useState } from 'react'
import type { ReactNode } from 'react'

import { Box, ListItem, MultiSelectField, SearchField } from '@gorgias/axiom'

import css from './SearchableItemPicker.less'

export type SearchableItemPickerItem = {
    id: string
    label: string
    leadingSlot?: ReactNode
    trailingSlot?: ReactNode
}

export type SearchableItemPickerSection = {
    id: string
    name?: string
    items: SearchableItemPickerItem[]
}

type SearchableItemPickerProps = {
    sections: SearchableItemPickerSection[]
    onSelect: (id: string) => void
    header?: ReactNode
    footer?: ReactNode
    isSearchable?: boolean
    placeholder?: string
    label?: string
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function SearchableItemPicker({
    sections,
    onSelect,
    header,
    footer,
    isSearchable = true,
    placeholder,
    label,
    isOpen,
    onOpenChange,
}: SearchableItemPickerProps) {
    const [search, setSearch] = useState('')

    const filteredItems = sections
        .flatMap((s) => s.items)
        .filter(
            (item) =>
                !search ||
                item.label.toLowerCase().includes(search.toLowerCase()),
        )

    const composedHeader =
        header != null || isSearchable ? (
            <Box flexDirection="column">
                {header}
                {isSearchable && (
                    <Box p="xs" className={css.searchWrapper}>
                        <SearchField
                            value={search}
                            onChange={setSearch}
                            placeholder={placeholder}
                            size="sm"
                            aria-label="Search"
                            variant="secondary"
                        />
                    </Box>
                )}
            </Box>
        ) : undefined

    return (
        <MultiSelectField
            items={filteredItems}
            label={label}
            maxHeight={250}
            header={composedHeader}
            footer={footer}
            value={[] as SearchableItemPickerItem[]}
            onChange={(selected) => {
                const last = selected[selected.length - 1]
                if (last) {
                    onSelect(last.id)
                }
            }}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            {(item) => (
                <ListItem
                    label={item.label}
                    leadingSlot={item.leadingSlot}
                    trailingSlot={item.trailingSlot}
                />
            )}
        </MultiSelectField>
    )
}
