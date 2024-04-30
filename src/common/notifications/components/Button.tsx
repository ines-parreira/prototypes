import {NotificationFeedPopover, RenderItemProps} from '@knocklabs/react'
import cn from 'classnames'
import React, {useCallback, useRef, useState} from 'react'

import navbarCss from 'assets/css/navbar.less'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import useCount from '../hooks/useCount'
import transformKnockNotification from '../utils/transformKnockNotification'

import FeedItem from './FeedItem'
import css from './Button.less'

export default function NotificationsButton() {
    const count = useCount()

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    const handleClick = useCallback(() => {
        setIsVisible((v) => !v)
    }, [])

    const handleClose = useCallback(() => {
        setIsVisible(false)
    }, [])

    const renderItem = useCallback(
        ({item}: RenderItemProps) => {
            const notification = transformKnockNotification(item)
            return !notification ? null : (
                <FeedItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleClose}
                />
            )
        },
        [handleClose]
    )

    return (
        <>
            <Button
                ref={buttonRef}
                className={navbarCss.navbarButton}
                fillStyle="ghost"
                onClick={handleClick}
            >
                <span className={cn(navbarCss['item-name'], css.name)}>
                    <ButtonIconLabel
                        icon="notifications"
                        iconClassName={navbarCss.buttonIcon}
                    />
                    Notifications
                </span>
                <span className={navbarCss['item-count']}>{count}</span>
            </Button>
            <NotificationFeedPopover
                buttonRef={buttonRef}
                isVisible={isVisible}
                placement="right-start"
                renderItem={renderItem}
                onClose={handleClose}
            />
        </>
    )
}
