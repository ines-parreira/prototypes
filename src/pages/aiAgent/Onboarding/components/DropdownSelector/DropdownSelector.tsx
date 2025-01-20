import React, {useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
// eslint-disable-next-line import/no-named-as-default
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox from 'pages/common/forms/input/SelectInputBox'

export const DropdownSelector: React.FC<{
    items: any[]
    selectedKey: number | null
    setSelectedKey: (id: number | null) => void
    selectedItem: any
    getItemKey: (item: any) => number
    getItemLabel: (item: any) => string
}> = ({
    items,
    selectedKey,
    setSelectedKey,
    selectedItem,
    getItemKey,
    getItemLabel,
}) => {
    const [isDropdownOpened, setIsDropdownOpened] = useState(false)

    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    return (
        <SelectInputBox
            floating={floatingRef}
            label={getItemLabel(selectedItem)}
            onToggle={setIsDropdownOpened}
            onClick={() => setIsDropdownOpened((prev) => !prev)}
            placeholder="Select one or more chat items"
            ref={targetRef}
            aria-expanded={isDropdownOpened}
            aria-controls="store-items-list"
        >
            <Dropdown
                id="store-items-list"
                isOpen={isDropdownOpened}
                onToggle={setIsDropdownOpened}
                ref={floatingRef}
                target={targetRef}
                value={selectedKey}
            >
                <DropdownSearch autoFocus />
                <DropdownBody>
                    {items.map((item) => (
                        <DropdownItem
                            key={getItemKey(item)}
                            option={{
                                label: getItemLabel(item),
                                value: getItemKey(item),
                            }}
                            onClick={(id) => {
                                setSelectedKey(id)
                                setIsDropdownOpened(false)
                            }}
                        >
                            {getItemLabel(item)}
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </SelectInputBox>
    )
}
