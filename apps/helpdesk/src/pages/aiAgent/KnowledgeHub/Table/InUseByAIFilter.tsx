import { useRef, useState } from 'react'

import { FilterButton, FilterValue } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

export type InUseByAIFilterProps = {
    value: boolean | null
    onChange: (value: boolean | null) => void
    onClear: () => void
}

function getFilterValue(value: boolean | null): string {
    if (value === null) return 'Select value...'
    return value ? 'True' : 'False'
}

export const InUseByAIFilter = ({
    value,
    onChange,
    onClear,
}: InUseByAIFilterProps) => {
    const buttonRef = useRef(null)
    const [isOpen, setIsOpen] = useState(value === null)

    const filterValue = getFilterValue(value)

    const handleToggle = () => {
        setIsOpen(!isOpen)
    }

    const handleValueChange = (selectedValue: boolean) => {
        onChange(selectedValue)
        setIsOpen(false)
    }

    const handleClear = () => {
        onClear()
    }

    return (
        <>
            <FilterButton
                label="In use by AI Agent"
                onClick={handleToggle}
                onClear={value !== null ? handleClear : undefined}
                ref={buttonRef}
            >
                <FilterValue value={filterValue} />
            </FilterButton>
            <Dropdown
                isOpen={isOpen}
                onToggle={handleToggle}
                target={buttonRef}
            >
                <DropdownBody>
                    <DropdownItem
                        option={{ label: 'True', value: 'true' }}
                        onClick={() => handleValueChange(true)}
                    >
                        True
                    </DropdownItem>
                    <DropdownItem
                        option={{ label: 'False', value: 'false' }}
                        onClick={() => handleValueChange(false)}
                    >
                        False
                    </DropdownItem>
                </DropdownBody>
            </Dropdown>
        </>
    )
}
