import cn from 'classnames'

import React, {useCallback, useRef, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import css from 'pages/tickets/detail/components/TicketActions.less'

export type Action = {
    label: string
    callback: () => void
}

type Props = {
    actions: Action[]
}

export const SAVED_FILTER_ACTIONS_MENU_ICON = 'more_vert'

export const SavedFilterMenu = ({actions}: Props) => {
    const [showDropdown, setShowDropdown] = useState(false)
    const toggleRef = useRef<HTMLButtonElement>(null)

    const handleClick = useCallback(() => {
        setShowDropdown((s) => !s)
    }, [])

    const handleToggleDropdown = useCallback(() => {
        setShowDropdown((s) => !s)
    }, [])

    return (
        <>
            <Button
                ref={toggleRef}
                className={css.button}
                fillStyle="ghost"
                intent="secondary"
                onClick={handleClick}
                size="medium"
            >
                <i className={cn(css.icon, 'material-icons')}>
                    {SAVED_FILTER_ACTIONS_MENU_ICON}
                </i>
            </Button>
            <Dropdown
                isOpen={showDropdown}
                offset={4}
                placement="bottom-end"
                target={toggleRef}
                onToggle={handleToggleDropdown}
            >
                <DropdownBody>
                    {actions.map(({label, callback}) => {
                        return (
                            <DropdownItem
                                key={label}
                                onClick={() => {
                                    callback()
                                }}
                                option={{label: label, value: ''}}
                                shouldCloseOnSelect
                            >
                                {label}
                            </DropdownItem>
                        )
                    })}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
