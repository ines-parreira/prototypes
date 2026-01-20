import { useState } from 'react'

import { Button, Icon, Menu, MenuItem, MenuSize } from '@gorgias/axiom'

export type FilterOption = {
    label: string
    value: string
}

type Props = {
    options: FilterOption[]
    onOptionSelect: (value: string) => void
}

export const ADD_FILTER_BUTTON_LABEL = 'Add Filter'

export const AddFilterButton = ({ options, onOptionSelect }: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleMenuOpenChange = (open: boolean) => {
        setIsOpen(open)
    }

    const handleOptionSelect = (value: string) => {
        onOptionSelect(value)
        setIsOpen(false)
    }

    return (
        <Menu
            isOpen={isOpen}
            onOpenChange={handleMenuOpenChange}
            size={MenuSize.Sm}
            trigger={
                <Button
                    variant="tertiary"
                    size="sm"
                    trailingSlot={<Icon name="arrow-chevron-down" />}
                    as="button"
                    data-candu-id="knowledge-hub-add-filter"
                >
                    {ADD_FILTER_BUTTON_LABEL}
                </Button>
            }
        >
            <>
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        id={option.value}
                        label={option.label}
                        onAction={() => handleOptionSelect(option.value)}
                    />
                ))}
            </>
        </Menu>
    )
}
