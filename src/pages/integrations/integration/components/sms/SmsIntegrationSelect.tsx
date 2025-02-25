import React, { useRef, useState } from 'react'

import { SmsIntegration } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

type SmsIntegrationSelectProps = {
    value: number | null
    options: SmsIntegration[]
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
                options.find((integration) => integration.id === value)?.name ??
                'Select SMS integration'
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
                        <DropdownBody>
                            {options.map((integration) => (
                                <DropdownItem
                                    key={integration.id}
                                    option={{
                                        label: integration.name,
                                        value: integration.id,
                                    }}
                                    onClick={() => onChange(integration.id)}
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
