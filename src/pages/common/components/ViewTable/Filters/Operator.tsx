import React, { useMemo, useRef, useState } from 'react'

import classNames from 'classnames'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import { OperatorType } from './types'

import css from './CallExpression.less'

type Option = { value: string; name: string }

type OperatorProps = {
    index: number
    operators: Record<string, OperatorType>
    selected: string
    onChange: (index: number, value: string) => void
}

export function Operator({
    index,
    operators,
    selected,
    onChange,
}: OperatorProps) {
    const [isOperatorOpen, setIsOperatorOpen] = useState<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const options: Option[] = useMemo(() => {
        const operatorKeys = Object.keys(operators)
        const defaultOptions = operatorKeys.map((operator: string) => ({
            value: operator,
            name: operators[operator].label,
        }))

        if (!operatorKeys.includes(selected)) {
            defaultOptions.push({
                value: selected,
                name: selected,
            })
        }

        return defaultOptions
    }, [operators, selected])

    const selectedOption = useMemo(
        () => options.find((option) => option.value === selected),
        [options, selected],
    )

    return (
        <SelectInputBox
            label={selectedOption?.name}
            onToggle={setIsOperatorOpen}
            floating={containerRef}
            ref={dropdownRef}
            className={classNames(css.operatorSelect, 'btn-light')}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isOperatorOpen}
                        onToggle={() => context!.onBlur()}
                        ref={containerRef}
                        target={dropdownRef}
                        value={selected}
                    >
                        <DropdownBody>
                            {options.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    shouldCloseOnSelect
                                    option={{
                                        label: option.name,
                                        value: option.value,
                                    }}
                                    onClick={() => {
                                        onChange(index, option.value)
                                    }}
                                />
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
