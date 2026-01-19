import React, { useCallback, useRef, useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import {
    getCurrentUser,
    isAvailable as getIsAvailable,
} from 'state/currentUser/selectors'

import UserMenu from './UserMenu'

import css from './UserItem.less'

export default function UserItem() {
    const currentUser = useAppSelector(getCurrentUser)
    const isAvailable = useAppSelector(getIsAvailable)

    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleToggle = useCallback(() => {
        setIsOpen((s) => !s)
    }, [])

    return (
        <>
            <button
                ref={buttonRef}
                className={css.container}
                type="button"
                onClick={handleToggle}
            >
                <Avatar
                    badgeClassName={css.badge}
                    badgeColor={
                        isAvailable
                            ? 'var(--static-success)'
                            : 'var(--static-warning)'
                    }
                    name={currentUser.get('name') || currentUser.get('email')}
                    url={currentUser.getIn(['meta', 'profile_picture_url'])}
                    shape="round"
                    size={24}
                />
            </button>

            <Dropdown
                className={css.dropdown}
                isOpen={isOpen}
                offset={8}
                placement="right-end"
                target={buttonRef}
                onToggle={handleToggle}
            >
                <UserMenu onClose={handleToggle} />
            </Dropdown>
        </>
    )
}
