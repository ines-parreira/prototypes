import { useEffect, useState } from 'react'

import classNames from 'classnames'

import selectedIcon from 'assets/img/ai-journey/selected.svg'

import css from './Dropdown.less'

type DropdownProps<T> = {
    options: T[]
    value?: T
    onChange?: (option: T) => void
    getLabel: (option: T) => string
    getValue: (option: T) => string | number
    placeholder?: string
    emptyMessage?: string
}

export const Dropdown = <T,>({
    options,
    value,
    onChange,
    getLabel,
    getValue,
    placeholder = 'Select',
    emptyMessage = 'No options available',
}: DropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<T | undefined>(value)

    useEffect(() => {
        setSelectedOption(value)
    }, [value])

    const dropdownOptionsClass = classNames(css.dropdownOptions, {
        [css['dropdownOptions--open']]: isOpen,
    })

    const selectedOptionClass = classNames(css.selectedOption, {
        [css['selectedOption--empty']]: !selectedOption,
    })

    const handleOptionChange = (option: T) => {
        setSelectedOption(option)
        setIsOpen(false)
        if (onChange) {
            onChange(option)
        }
    }

    const hasAvailableOptions = options?.length > 0

    return (
        <div
            className={css.selector}
            role="group"
            tabIndex={0}
            onBlur={() => setIsOpen(false)}
        >
            <div
                className={css.dropdownSelect}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedOptionClass}>
                    {selectedOption ? getLabel(selectedOption) : placeholder}
                </span>
                <i className="material-icons-outlined">keyboard_arrow_down</i>
            </div>
            <ul className={dropdownOptionsClass} role="listbox">
                {hasAvailableOptions ? (
                    options?.map((option, index) => (
                        <li
                            className={css.dropdownOption}
                            key={index}
                            onClick={() => handleOptionChange(option)}
                        >
                            <span>{getLabel(option)}</span>
                            {selectedOption &&
                                getValue(option) ===
                                    getValue(selectedOption) && (
                                    <img src={selectedIcon} alt="icon" />
                                )}
                        </li>
                    ))
                ) : (
                    <li className={css.dropdownOption}>
                        <span>{emptyMessage}</span>
                    </li>
                )}
            </ul>
        </div>
    )
}
