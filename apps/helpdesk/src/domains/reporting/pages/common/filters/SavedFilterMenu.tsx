import React, { useCallback, useRef, useState } from 'react'

import cn from 'classnames'

import { LegacyButton as Button, Tooltip } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import css from 'pages/tickets/detail/components/TicketActions.less'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export type Action = {
    label: string
    callback: () => void
}

type Props = {
    actions: Action[]
}

const DISABLED_MENU_TOOLTIP =
    'Only team leads and admin users are able to save, duplicate, or delete saved filters.'
export const SAVED_FILTER_ACTIONS_MENU_ICON = 'more_vert'

export const SavedFilterMenu = ({ actions }: Props) => {
    const user = useAppSelector(getCurrentUser)
    const isTeamLeadOrAdmin = isTeamLead(user)
    const [showDropdown, setShowDropdown] = useState(false)
    const toggleRef = useRef<HTMLButtonElement>(null)
    const tooltipRef = useRef<HTMLElement>(null)

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
                id="saved-filter-actions-button"
                intent="secondary"
                onClick={handleClick}
                size="medium"
                isDisabled={!isTeamLeadOrAdmin}
            >
                <i className={cn(css.icon, 'material-icons')} ref={tooltipRef}>
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
                    {actions.map(({ label, callback }) => {
                        return (
                            <DropdownItem
                                key={label}
                                onClick={() => {
                                    callback()
                                }}
                                option={{ label: label, value: '' }}
                                shouldCloseOnSelect
                            >
                                {label}
                            </DropdownItem>
                        )
                    })}
                </DropdownBody>
            </Dropdown>
            <Tooltip
                target={tooltipRef}
                placement={'top'}
                boundariesElement={'body'}
            >
                {DISABLED_MENU_TOOLTIP}
            </Tooltip>
        </>
    )
}
