import React from 'react'
import classNames from 'classnames'

import {
    NotificationStatus,
    Notification,
} from '../../../../state/notifications/types'

import infoIcon from '../../../../../img/icons/info.svg'
import successIcon from '../../../../../img/icons/success.svg'
import warningIcon from '../../../../../img/icons/warning2.svg'
import errorIcon from '../../../../../img/icons/error.svg'
import closeIcon from '../../../../../img/icons/close.svg'

import css from './BannerNotification.less'

const bannerIcon = {
    [NotificationStatus.Info]: infoIcon,
    [NotificationStatus.Success]: successIcon,
    [NotificationStatus.Warning]: warningIcon,
    [NotificationStatus.Error]: errorIcon,
}

type Props = {
    hide?: (value: string | number) => void
    id: string | number
    actionHTML?: string
    onClose?: () => void
    message: string
    status?: Exclude<NotificationStatus, NotificationStatus.Loading>
} & Pick<
    Notification,
    'allowHTML' | 'closable' | 'dismissible' | 'onClick' | 'showIcon'
>

const BannerNotification = ({
    allowHTML = true,
    closable = false,
    dismissible = true,
    hide,
    id,
    message,
    actionHTML,
    onClick,
    onClose,
    status = NotificationStatus.Info,
    showIcon = false,
}: Props) => {
    const handleClick = () => {
        onClick?.()

        if (dismissible) {
            hide?.(id)
        }
    }

    const handleClose = () => {
        hide?.(id)
        onClose?.()
    }

    return (
        <div
            className={classNames(css.bannerNotification, css[status], {
                [css.clickable]: onClick || dismissible,
            })}
        >
            <div className={css.messageContainer} onClick={handleClick}>
                {showIcon && (
                    <img
                        src={bannerIcon[status]}
                        alt="icon"
                        className={css.icon}
                    />
                )}
                <span className={css.messageText}>
                    {allowHTML ? (
                        <span
                            dangerouslySetInnerHTML={{
                                __html: message,
                            }}
                        />
                    ) : (
                        <span>{message}</span>
                    )}
                    {actionHTML && (
                        <>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: actionHTML,
                                }}
                                className={css.messageAction}
                            />
                        </>
                    )}
                </span>
            </div>
            {closable && (
                <span className={css.closeIconContainer}>
                    <img
                        src={closeIcon}
                        alt="close-icon"
                        onClick={handleClose}
                        className={css.closeIcon}
                    />
                </span>
            )}
        </div>
    )
}

export default BannerNotification
