import { useEffect, useState } from 'react'

import classNames from 'classnames'

import arrowIcon from 'assets/img/ai-journey/arrow.svg'
import checkedIcon from 'assets/img/ai-journey/checked.svg'
import selectedIcon from 'assets/img/ai-journey/selected.svg'
import { NewPhoneNumber } from 'models/phoneNumber/types'

import css from './Dropdown.less'

type DropdownProps = {
    options: NewPhoneNumber[]
    value?: NewPhoneNumber
    onChange?: (option: NewPhoneNumber) => void
}

export const Dropdown = ({ options, value, onChange }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<
        NewPhoneNumber | undefined
    >(value)

    useEffect(() => {
        setSelectedOption(value)
    }, [value])

    const dropdownOptionsClass = classNames(css.dropdownOptions, {
        [css['dropdownOptions--open']]: isOpen,
    })

    const selectedOptionClass = classNames(css.selectedOption, {
        [css['selectedOption--empty']]: !selectedOption,
    })

    const handleOptionChange = (option: NewPhoneNumber) => {
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
                {selectedOption && <img src={checkedIcon} alt="icon" />}
                <span className={selectedOptionClass}>
                    {selectedOption?.phone_number_friendly.replace(
                        /^[^\s]+\s/,
                        '',
                    ) || 'Select'}
                </span>
                <img src={arrowIcon} alt="arrow" />
            </div>
            <ul className={dropdownOptionsClass} role="listbox">
                {hasAvailableOptions ? (
                    options?.map((option, index) => (
                        <li
                            className={css.dropdownOption}
                            key={index}
                            onClick={() => handleOptionChange(option)}
                        >
                            <span>
                                {option.phone_number_friendly.replace(
                                    /^[^\s]+\s/,
                                    '',
                                )}
                            </span>
                            {option.integrations[0].id ===
                                selectedOption?.integrations[0].id && (
                                <img src={selectedIcon} alt="icon" />
                            )}
                        </li>
                    ))
                ) : (
                    <li className={css.dropdownOption}>
                        <span>No numbers available</span>
                    </li>
                )}
            </ul>
        </div>
    )
}
