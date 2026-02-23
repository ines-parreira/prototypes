import {
    Button,
    CheckBoxField,
    ListItem,
    ListSection,
    MultiSelect,
    Tag,
} from '@gorgias/axiom'

import css from './FilterTag.less'

type Section<T> = {
    id: string | number
    name: string
    items: T[]
}

type FilterTagProps<T extends { id: string | number; label: string }> = {
    label: string
    onRemove: () => void
    items?: T[]
    sections?: Section<T>[]
    selectedItems?: T[]
    onSelect?: (items: T[]) => void
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
}

export function FilterTag<T extends { id: string | number; label: string }>({
    label,
    onRemove,
    items = [],
    sections,
    selectedItems = [],
    onSelect,
    isOpen,
    onOpenChange,
}: FilterTagProps<T>) {
    // If no items and no sections, just show a simple tag
    if (items.length === 0 && !sections) {
        return <Tag onClose={onRemove}>{label}</Tag>
    }

    // Show placeholder when no items are selected
    const displayLabel = selectedItems.length === 0 ? 'Select an option' : label

    const triggerButton = () => (
        <Button
            size="sm"
            style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'inline-block',
            }}
        >
            <div className={css.tagWrapper}>
                <Tag onClose={onRemove}>{displayLabel}</Tag>
            </div>
        </Button>
    )

    // Render with sections
    if (sections) {
        return (
            <MultiSelect
                items={sections as any}
                selectedItems={selectedItems as any}
                onSelect={onSelect as any}
                selectionBehavior="toggle"
                trigger={triggerButton}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                {(section: Section<T>) => (
                    <ListSection
                        id={section.name}
                        name={section.name}
                        items={section.items}
                    >
                        {(item: T) => (
                            <ListItem
                                label={item.label}
                                leadingSlot={({ isSelected }) => (
                                    <CheckBoxField value={isSelected} />
                                )}
                            />
                        )}
                    </ListSection>
                )}
            </MultiSelect>
        )
    }

    // Render with flat items
    return (
        <MultiSelect
            items={items}
            selectedItems={selectedItems}
            onSelect={onSelect}
            selectionBehavior="toggle"
            trigger={triggerButton}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            {(item: T) => (
                <ListItem
                    label={item.label}
                    leadingSlot={({ isSelected }) => (
                        <CheckBoxField value={isSelected} />
                    )}
                />
            )}
        </MultiSelect>
    )
}
