import React, { useRef, useState } from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

type SmsIntegrationSelectProps = {
    value: number | null
    options: {
        label: string
        value: number
    }[]
    onChange: (id: number) => void
}

export default function SmsIntegrationSelect({
    value,
    options,
    onChange,
}: SmsIntegrationSelectProps) {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <SelectInputBox
            onToggle={setIsOpen}
            label={
                options.find((option) => option.value === value)?.label ??
                'Search'
            }
            ref={selectRef}
            floating={floatingSelectRef}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingSelectRef}
                        target={selectRef}
                        value={value}
                    >
                        <DropdownSearch autoFocus />
                        <DropdownBody>
                            {options.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    option={option}
                                    onClick={() => onChange(option.value)}
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
