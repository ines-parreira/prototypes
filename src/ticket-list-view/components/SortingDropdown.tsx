import React, {useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './TicketListView.less'

const sortingOptions = [
    {value: 'oldest', label: 'Oldest'},
    {value: 'newest', label: 'Newest'},
]

export default function SortingDropdown() {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [sortingValue, setSortingValue] = useState(sortingOptions[0])

    return (
        <SelectInputBox
            ref={targetRef}
            className={css.sortingSelect}
            floating={floatingRef}
            onToggle={setIsOpen}
            label={sortingValue?.label}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        ref={floatingRef}
                        target={targetRef}
                        className={css.dropdown}
                        isOpen={isOpen}
                        onToggle={() => context!.onBlur()}
                        value={sortingValue.value}
                        placement="bottom-end"
                    >
                        <DropdownBody>
                            {sortingOptions.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    onClick={() => setSortingValue(option)}
                                    option={option}
                                    shouldCloseOnSelect
                                />
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
