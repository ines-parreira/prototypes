import { useCallback, useRef, useState } from 'react'

import {
    logEvent,
    NotificationCenterEventTypes,
    SegmentEvent,
} from '@repo/logging'
import cn from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import navbarCss from 'assets/css/navbar.less'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'

import useCount from '../hooks/useCount'
import Feed from './Feed'

import css from './Button.less'

export default function NotificationsButton() {
    const count = useCount()

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    const handleClick = useCallback(() => {
        if (!isVisible) {
            logEvent(SegmentEvent.NotificationCenter, {
                type: NotificationCenterEventTypes.Opened,
            })
        }
        setIsVisible(!isVisible)
    }, [isVisible])

    const handleClose = useCallback(() => {
        setIsVisible(false)
    }, [])

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
                        className={navbarCss.buttonIcon}
                    />
                    Notifications
                </span>
                {count > 0 && (
                    <span className={cn(navbarCss['item-count'], css.count)}>
                        {count}
                    </span>
                )}
            </Button>
            <Dropdown
                className={css.dropdown}
                isOpen={isVisible}
                offset={10}
                placement="right-start"
                target={buttonRef}
                onToggle={handleClose}
            >
                <Feed />
            </Dropdown>
        </>
    )
}
