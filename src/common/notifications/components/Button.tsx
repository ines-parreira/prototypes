import cn from 'classnames'
import React from 'react'

import navbarCss from 'assets/css/navbar.less'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './Button.less'

export default function NotificationsButton() {
    return (
        <Button className={navbarCss.navbarButton} fillStyle="ghost">
            <span className={cn(navbarCss['item-name'], css.name)}>
                <ButtonIconLabel
                    icon="notifications"
                    iconClassName={navbarCss.buttonIcon}
                />
                Notifications
            </span>
            <span className={navbarCss['item-count']}>100</span>
        </Button>
    )
}
