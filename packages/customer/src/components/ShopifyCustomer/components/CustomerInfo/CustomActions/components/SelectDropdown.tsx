import type { RefObject } from 'react'

import { ListItem, Select, SelectTrigger, TextField } from '@gorgias/axiom'

type SelectItem = { id: string; name: string }

type Props = {
    items: SelectItem[]
    selectedItem: SelectItem | null
    onSelect: (item: SelectItem) => void
    'aria-label'?: string
    'aria-labelledby'?: string
    id?: string
    size?: 'sm' | 'md'
    placeholder?: string
}

export function SelectDropdown({
    items,
    selectedItem,
    onSelect,
    id,
    size,
    placeholder,
    ...ariaProps
}: Props) {
    return (
        <Select
            items={items}
            selectedItem={selectedItem}
            onSelect={onSelect}
            trigger={({ ref, isOpen, selectedText }) => (
                <SelectTrigger>
                    <TextField
                        id={id}
                        inputRef={ref as RefObject<HTMLInputElement>}
                        isFocused={isOpen}
                        trailingSlot={
                            isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'
                        }
                        value={selectedText}
                        size={size}
                        placeholder={placeholder}
                        aria-label={ariaProps['aria-label']}
                        aria-labelledby={ariaProps['aria-labelledby']}
                    />
                </SelectTrigger>
            )}
        >
            {(item) => <ListItem id={item.id} label={item.name} />}
        </Select>
    )
}
