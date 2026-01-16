import { useRef, useState } from 'react'

import { Button } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

type LearnOption = {
    value: string
    label: string
    url: string
}

const LEARN_OPTIONS: LearnOption[] = [
    {
        value: 'add-content',
        label: "Add your brand's content for AI Agent",
        url: 'https://link.gorgias.com/bdb652',
    },
    {
        value: 'manage-content',
        label: 'Manage existing content for AI Agent',
        url: 'https://link.gorgias.com/45efcd',
    },
]

export const LearnDropdown = () => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (option: LearnOption) => {
        window.open(option.url, '_blank', 'noopener,noreferrer')
        setIsOpen(false)
    }

    return (
        <>
            <Button
                as="button"
                ref={buttonRef}
                intent="regular"
                size="md"
                trailingSlot="arrow-chevron-down"
                variant="tertiary"
                onClick={() => setIsOpen(!isOpen)}
            >
                Learnning resources
            </Button>
            <Dropdown
                target={buttonRef}
                isOpen={isOpen}
                onToggle={setIsOpen}
                placement="bottom-end"
            >
                <DropdownBody>
                    {LEARN_OPTIONS.map((option) => (
                        <DropdownItem
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            option={option}
                            shouldCloseOnSelect
                        >
                            {option.label}
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
