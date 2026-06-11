import type { MouseEvent } from 'react'
import React, { useCallback } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'

import { Button, Icon } from '@gorgias/axiom'

import { IconButton } from 'pages/common/components/button/IconButton'

import type { Notification } from '../types'
import { getNotificationConfig } from '../utils/getNotificationConfig'

import css from './Toast.less'

type Props = {
    notification: Notification
    onClick: () => void
    onDismiss: () => void
}

export function Toast({ notification, onClick, onDismiss }: Props) {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

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

    if (hasWayfindingMS1Flag) {
        return (
            <div className={css.container}>
                <Component notification={notification} onClick={onClick} />
                <div className={css.closeButton}>
                    <Button
                        icon={<Icon name="close" />}
                        variant="tertiary"
                        size="sm"
                        aria-label="Dismiss"
                        onClick={handleClickClose}
                    />
                </div>
            </div>
        )
    }

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
