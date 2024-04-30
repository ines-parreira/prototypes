import React, {MouseEvent, useCallback} from 'react'

import IconButton from 'pages/common/components/button/IconButton'

import {Notification} from '../types'

import NotificationContent from './NotificationContent'
import css from './Toast.less'

type Props = {
    notification: Notification
    onDismiss: () => void
}

export default function Toast({notification, onDismiss}: Props) {
    const handleClickClose = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
            onDismiss()
        },
        [onDismiss]
    )

    return (
        <div className={css.container}>
            <NotificationContent
                headerExtra={
                    <IconButton
                        className={css.close}
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={handleClickClose}
                    >
                        close
                    </IconButton>
                }
                notification={notification}
            />
        </div>
    )
}
