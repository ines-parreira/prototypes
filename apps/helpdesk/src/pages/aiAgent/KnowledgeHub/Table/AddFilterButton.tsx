import React, { useRef, useState } from 'react'

import { Button, Icon } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

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
    const buttonRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const onToggle = () => setIsOpen(!isOpen)
    const handleOnClick = (value: string) => {
        onOptionSelect(value)
        setIsOpen(false)
    }

    return (
        <>
            <Button
                variant="tertiary"
                onClick={onToggle}
                ref={buttonRef}
                size="sm"
                trailingSlot={<Icon name="arrow-chevron-down" />}
                as="button"
            >
                {ADD_FILTER_BUTTON_LABEL}
            </Button>
            <Dropdown isOpen={isOpen} onToggle={onToggle} target={buttonRef}>
                <DropdownBody>
                    {options.map((option) => (
                        <DropdownItem
                            key={option.value}
                            option={option}
                            onClick={() => handleOnClick(option.value)}
                        >
                            {option.label}
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
