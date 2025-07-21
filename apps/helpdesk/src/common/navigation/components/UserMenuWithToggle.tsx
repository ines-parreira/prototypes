import React, { useCallback, useRef, useState } from 'react'

import cn from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import {
    getCurrentUser,
    isAvailable as getIsAvailable,
} from 'state/currentUser/selectors'

import UserMenu from './UserMenu'

import css from './UserMenuWithToggle.less'

export default function UserMenuWithToggle() {
    const currentUser = useAppSelector(getCurrentUser)
    const isAvailable = useAppSelector(getIsAvailable)
    const [isOpen, setIsOpen] = useState(false)
    const toggleRef = useRef<HTMLButtonElement | null>(null)

    const toggleIsOpen = useCallback(() => {
        setIsOpen((o) => !o)
    }, [])

    return (
        <>
            <button
                ref={toggleRef}
                className={cn(
                    css['dropdown-toggle'],
                    css['dropdown-toggle-dropup'],
                    { [css.active]: isOpen },
                )}
                onClick={toggleIsOpen}
                data-candu-id="navbar-user-menu"
            >
                <div>{currentUser.get('name') || currentUser.get('email')}</div>
                <Avatar
                    name={currentUser.get('name') || currentUser.get('email')}
                    url={currentUser.getIn(['meta', 'profile_picture_url'])}
                    size={36}
                    badgeColor={isAvailable ? '#24d69d' : '#FF9600'}
                />
            </button>
            <Dropdown
                className={css.menuContent}
                isOpen={isOpen}
                onToggle={toggleIsOpen}
                target={toggleRef}
                placement="top-start"
                offset={0}
            >
                <UserMenu onClose={toggleIsOpen} />
            </Dropdown>
        </>
    )
}
