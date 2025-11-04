import React, { useMemo, useRef, useState } from 'react'

import {
    LegacyLabel as Label,
    LegacyTextField as TextField,
} from '@gorgias/axiom'

import { states } from 'fixtures/states'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './ProvinceInputNew.less'

type Props = {
    disabled?: boolean
    label?: string
    onChange: (nextValue: string) => void
    country: string
    name: string
    hasError?: boolean
    error?: string
    isRequired?: boolean
    value: string
    className?: string
}

const ProvinceInputNew = ({
    className,
    label = 'State',
    onChange,
    country,
    name,
    hasError,
    error,
    isRequired = false,
    value,
    disabled,
}: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const floatingRef = useRef<HTMLInputElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const provinces = useMemo(() => {
        const stateObj = states.find((state) => state.name === country)
        return stateObj?.provinces || []
    }, [country])

    const handleChange = (province: string) => {
        setIsDropdownOpen(false)
        onChange(province)
    }

    if (provinces.length > 0) {
        return (
            <div className={className}>
                {label && (
                    <Label className={css.label} isRequired={isRequired}>
                        {label}
                    </Label>
                )}

                <SelectInputBox
                    ref={inputRef}
                    floating={floatingRef}
                    label={value}
                    onToggle={setIsDropdownOpen}
                    hasError={hasError}
                    error={error}
                    placeholder={'Select state or province...'}
                    isDisabled={disabled}
                >
                    <SelectInputBoxContext.Consumer>
                        {(context) => (
                            <Dropdown
                                target={inputRef}
                                isOpen={isDropdownOpen}
                                ref={floatingRef}
                                onToggle={() => context!.onBlur()}
                                value={value}
                                contained
                            >
                                <DropdownSearch autoFocus />
                                <DropdownBody>
                                    {provinces.map((option) => (
                                        <DropdownItem
                                            key={option}
                                            option={{
                                                value: option,
                                                label: option,
                                            }}
                                            onClick={handleChange}
                                            shouldCloseOnSelect
                                        />
                                    ))}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>
            </div>
        )
    }

    return (
        <TextField
            name={name}
            label={label}
            className={className}
            onChange={onChange}
            value={value}
            error={hasError ? error : ''}
            placeholder="Type state or province..."
            isRequired={isRequired}
            isDisabled={disabled}
        />
    )
}

export default ProvinceInputNew
