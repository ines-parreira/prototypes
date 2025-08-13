import React, { useRef, useState } from 'react'

import { Button, Tooltip } from '@gorgias/axiom'

import { PhoneIntegration } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import usePhoneNumbers from './usePhoneNumbers'

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

    const { getPhoneNumberById } = usePhoneNumbers()

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
                leadingIcon="phone"
                trailingIcon="arrow_drop_down"
            >
                <div
                    className={css.integrationSelectorLabel}
                    id="integration-selector-label"
                >
                    {value.name}
                </div>
            </Button>
            <Tooltip target="integration-selector-label">{value.name}</Tooltip>
            <Dropdown
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
                ref={floatingRef}
                target={targetRef}
                value={value?.id}
                placement="bottom"
            >
                <DropdownBody>
                    {options?.map((option) => {
                        const friendlyAddress = getPhoneNumberById(
                            option.meta.phone_number_id,
                        )?.phone_number_friendly
                        return (
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
                                {option.meta.emoji}
                                <div>{option.name}</div>
                                {friendlyAddress && `(${friendlyAddress})`}
                            </DropdownItem>
                        )
                    })}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
