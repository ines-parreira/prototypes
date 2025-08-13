import { useCallback, useRef, useState } from 'react'

import classNames from 'classnames'

import Dropdown from 'pages/common/components/dropdown/Dropdown'

import css from './AddStepButton.less'

export type AddButtonProps = {
    children?: React.ReactNode
}

export function AddStepButton({ children }: AddButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const handleButtonClick = useCallback(() => {
        setIsDropdownOpen((prev) => !prev)
    }, [])

    const handleDropdownClose = useCallback(() => {
        setIsDropdownOpen(false)
    }, [])

    return (
        <>
            <button
                ref={buttonRef}
                className={classNames(css.addButton, {
                    [css.selected]: isDropdownOpen,
                })}
                aria-label="Add"
                type="button"
                onClick={handleButtonClick}
            >
                <i className="material-icons">add</i>
            </button>

            {children && (
                <Dropdown
                    target={buttonRef}
                    isOpen={isDropdownOpen}
                    onToggle={setIsDropdownOpen}
                >
                    <div
                        onClick={handleDropdownClose}
                        className={css.dropdownBody}
                    >
                        {children}
                    </div>
                </Dropdown>
            )}
        </>
    )
}
