import { useCallback, useRef, useState } from 'react'

import cn from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import { Item } from 'components/Dropdown'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'

import UserAssigneeDropdownMenu from './UserAssigneeDropdownMenu'

import css from './style.less'

export default function AssignUser({
    isDisabled,
    onClick,
}: {
    onClick: (item: Item | null) => void
    isDisabled: boolean
}) {
    const ref = useRef(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const onItemSelect = useCallback(
        (user: Item | null) => {
            onClick(user)
            setIsDropdownOpen(false)
        },
        [onClick],
    )

    return (
        <>
            <IconButton
                ref={ref}
                className={cn(css.button, {
                    [css.isOpen]: isDropdownOpen,
                })}
                size="small"
                fillStyle="ghost"
                intent="secondary"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                isDisabled={isDisabled}
            >
                person
            </IconButton>
            <Tooltip target={ref}>Assign user</Tooltip>
            <Dropdown
                className={css.dropdown}
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
                target={ref}
                placement="bottom-end"
            >
                <UserAssigneeDropdownMenu onClick={onItemSelect} />
            </Dropdown>
        </>
    )
}
