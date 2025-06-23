import { useState } from 'react'

import classNames from 'classnames'

import arrowIcon from 'assets/img/ai-journey/arrow.svg'
import checkedIcon from 'assets/img/ai-journey/checked.svg'
import selectedIcon from 'assets/img/ai-journey/selected.svg'

import css from './Dropdown.less'

type DropdownProps = {
    options?: string[]
    value?: string
    onChange?: (option: string) => void
}

export const Dropdown = ({ options, value, onChange }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string | undefined>(
        value,
    )

    const dropdownOptionsClass = classNames(css.dropdownOptions, {
        [css['dropdownOptions--open']]: isOpen,
    })

    const selectedOptionClass = classNames(css.selectedOption, {
        [css['selectedOption--empty']]: !selectedOption,
    })

    const handleOptionChange = (option: string) => {
        setSelectedOption(option)
        setIsOpen(false)
        if (onChange) {
            onChange(option)
        }
    }

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
                {selectedOption && <img src={checkedIcon} alt="icon" />}
                <span className={selectedOptionClass}>
                    {selectedOption || 'Select'}
                </span>
                <img src={arrowIcon} alt="arrow" />
            </div>
            <ul className={dropdownOptionsClass} role="listbox">
                {options?.map((option, index) => (
                    <li
                        className={css.dropdownOption}
                        key={index}
                        onClick={() => handleOptionChange(option)}
                    >
                        <span>{option}</span>
                        {option === selectedOption && (
                            <img src={selectedIcon} alt="icon" />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}
