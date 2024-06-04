import React, {useRef, useState} from 'react'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import {PhoneIntegration} from 'models/integration/types'

import css from './PhoneDevice.less'

type Props = {
    value: PhoneIntegration
    onChange: (integration: PhoneIntegration) => void
    options: PhoneIntegration[]
}

export default function PhoneDeviceDialerIntegrationSelect({
    value,
    onChange,
    options,
}: Props) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const targetRef = useRef<HTMLButtonElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <Button
                fillStyle="ghost"
                size="small"
                intent="secondary"
                onClick={() => setIsDropdownOpen((open) => !open)}
                ref={targetRef}
                data-testid="toggle-integration-dropdown"
            >
                <ButtonIconLabel icon="phone" />
                {value.name}
                <ButtonIconLabel icon="arrow_drop_down" />
            </Button>
            <Dropdown
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
                ref={floatingRef}
                target={targetRef}
                value={value?.name}
                placement="bottom"
            >
                <DropdownBody>
                    {options?.map((option) => (
                        <DropdownItem
                            key={option.id}
                            option={{
                                label: option.name,
                                value: option.id,
                            }}
                            onClick={() => onChange(option)}
                            shouldCloseOnSelect
                            className={css.integrationSelectorItem}
                        >
                            {option.meta?.emoji}
                            <div>{option.name}</div>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
