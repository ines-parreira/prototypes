import React, {MouseEvent, useCallback} from 'react'

import IconButton from 'pages/common/components/button/IconButton'

import {notifications} from '../data'
import {Notification} from '../types'

import css from './Toast.less'

type Props = {
    notification: Notification
    onClick: () => void
    onDismiss: () => void
}

export default function Toast({notification, onClick, onDismiss}: Props) {
    const handleClickClose = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
            onDismiss()
        },
        [onDismiss]
    )

    const config = notifications[notification.type]
    if (!config) return null

    const Component = config.component

    return (
        <div className={css.container}>
            <Component
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
                onClick={onClick}
            />
        </div>
    )
}
