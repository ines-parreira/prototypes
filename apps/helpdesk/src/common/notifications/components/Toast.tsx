import type { MouseEvent } from 'react'
import React, { useCallback } from 'react'

import IconButton from 'pages/common/components/button/IconButton'

import type { Notification } from '../types'
import getNotificationConfig from '../utils/getNotificationConfig'

import css from './Toast.less'

type Props = {
    notification: Notification
    onClick: () => void
    onDismiss: () => void
}

export default function Toast({ notification, onClick, onDismiss }: Props) {
    const handleClickClose = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
            onDismiss()
        },
        [onDismiss],
    )

    const config = getNotificationConfig(notification)
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
