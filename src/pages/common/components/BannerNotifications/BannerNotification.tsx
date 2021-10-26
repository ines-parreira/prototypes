import React, {ReactNode} from 'react'
import classNames from 'classnames'

import {NotificationStatus} from '../../../../state/notifications/types'

type Props = {
    allowHTML: boolean
    closable: boolean
    dismissible: boolean
    hide: (value: string | number) => void
    id: string | number
    message: string | ReactNode
    onClick?: () => void
    onClose?: () => void
    status: NotificationStatus
}

const BannerNotification = ({
    allowHTML = true,
    closable = false,
    dismissible = true,
    hide,
    id,
    message,
    onClick,
    onClose,
    status,
}: Props) => {
    const handleClick = () => {
        onClick?.()

        if (dismissible) {
            hide(id)
        }
    }

    const handleClose = () => {
        hide(id)
        onClose?.()
    }

    return (
        <div
            className={classNames(
                'banner-notification',
                'banner-notification--active',
                `banner-notification--${status}`,
                {
                    'banner-notification--clickable': onClick || dismissible,
                }
            )}
        >
            {allowHTML ? (
                <span
                    onClick={handleClick}
                    className="banner-notification-message"
                    dangerouslySetInnerHTML={{__html: message as string}}
                ></span>
            ) : (
                <span
                    onClick={handleClick}
                    className="banner-notification-message"
                >
                    {message}
                </span>
            )}
            {closable && (
                <span className="banner-notification-message__close">
                    <span>
                        <i className="material-icons" onClick={handleClose}>
                            close
                        </i>
                    </span>
                </span>
            )}
        </div>
    )
}

export default BannerNotification
