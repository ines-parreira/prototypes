import React, {ComponentProps, useMemo} from 'react'
import {STATUSES} from 'reapop'
import ReapopNotificationIcon from 'reapop/dist/components/NotificationIcon'

import infoIcon from 'assets/img/icons/info.svg'
import successIcon from 'assets/img/icons/success.svg'
import warningIcon from 'assets/img/icons/warning2.svg'
import errorIcon from 'assets/img/icons/error.svg'
import loadingIcon from 'assets/img/icons/loading.svg'

const icon = {
    [STATUSES.info]: infoIcon,
    [STATUSES.success]: successIcon,
    [STATUSES.warning]: warningIcon,
    [STATUSES.error]: errorIcon,
    [STATUSES.loading]: loadingIcon,
}

export const NotificationIcon = ({
    notification,
    theme,
}: ComponentProps<typeof ReapopNotificationIcon>) => {
    const style = useMemo(() => {
        if (theme) {
            return theme.notificationIcon(notification)
        }
        return {}
    }, [notification, theme])

    return (
        <img
            src={
                icon[notification.status as keyof Omit<typeof STATUSES, 'none'>]
            }
            alt="icon"
            style={style}
        />
    )
}
