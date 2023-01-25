import React, {useCallback, useEffect, useRef, useState} from 'react'

import {CustomFieldValue} from 'models/customField/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import Label from '../Label'
import StealthInput from '../StealthInput'

type Value = string | number | readonly string[]

type Props = {
    label: string
    value?: Value
    choices: string[]
    placeholder?: string
    isRequired?: boolean
    onChange: (newValue: CustomFieldValue['value'], leading?: boolean) => void
}

export default function DropdownField({
    label,
    value,
    choices,
    onChange,
    isRequired,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isActive, setActive] = useState(false)

    const handleChange = useCallback(
        (value: string) => {
            // focus needs to be done before setting active to false
            inputRef.current?.focus()
            onChange(value)
            setActive(false)
        },

        [onChange]
    )

    // mandaroy to handle tab focusout
    useEffect(() => {
        function handleKeyUp(evt: KeyboardEvent) {
            if (evt.key === 'Tab') setActive(false)
        }
        if (isActive) {
            window.addEventListener('keydown', handleKeyUp)
        }
        return () => window.removeEventListener('keydown', handleKeyUp)
    }, [isActive])

    return (
        <>
            <Label label={label} isRequired={isRequired}>
                <StealthInput
                    ref={inputRef}
                    name={label}
                    value={value || ''}
                    isActive={isActive}
                    onFocus={() => setActive(true)}
                    onClick={() => setActive(true)}
                />
            </Label>
            <Dropdown
                isOpen={isActive}
                onToggle={(isVisible) => setActive(isVisible)}
                target={inputRef}
            >
                <DropdownBody>
                    {choices.map((option) => (
                        <DropdownItem
                            key={option}
                            option={{
                                label: option,
                                value: option,
                            }}
                            onClick={handleChange}
                        />
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
