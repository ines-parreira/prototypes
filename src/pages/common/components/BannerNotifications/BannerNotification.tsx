import React, {ReactElement, ReactNode} from 'react'
import classNames from 'classnames'

import infoIcon from 'assets/img/icons/info.svg'
import successIcon from 'assets/img/icons/success.svg'
import warningIcon from 'assets/img/icons/warning2.svg'
import errorIcon from 'assets/img/icons/error.svg'
import closeIcon from 'assets/img/icons/close.svg'

import {
    NotificationStatus,
    Notification,
} from '../../../../state/notifications/types'

import css from './BannerNotification.less'

const bannerIcon = {
    [NotificationStatus.Info]: infoIcon,
    [NotificationStatus.Success]: successIcon,
    [NotificationStatus.Warning]: warningIcon,
    [NotificationStatus.Error]: errorIcon,
}

export type Props = {
    hide?: (value: string | number | undefined) => void
    id?: string | number
    actionHTML?: ReactNode
    onClose?: () => void
    message: ReactElement | string
    status?: Exclude<NotificationStatus, NotificationStatus.Loading>
    borderless?: boolean
} & Pick<
    Notification,
    'allowHTML' | 'closable' | 'dismissible' | 'onClick' | 'showIcon'
>

const BannerNotification = ({
    allowHTML = true,
    closable = false,
    dismissible = true,
    borderless = false,
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
                [css.borderless]: borderless,
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
                    {allowHTML && typeof message === 'string' ? (
                        <span
                            dangerouslySetInnerHTML={{
                                __html: message,
                            }}
                        />
                    ) : (
                        <span>{message}</span>
                    )}
                    {actionHTML &&
                        (typeof actionHTML === 'string' ? (
                            <>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: actionHTML,
                                    }}
                                    className={css.messageAction}
                                />
                            </>
                        ) : (
                            actionHTML
                        ))}
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
