import { useCallback, useRef } from 'react'

import _uniqueId from 'lodash/uniqueId'
import { POSITIONS } from 'reapop'

import { JobType } from '@gorgias/api-queries'

import {
    AlertNotification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import { buildJobMessage } from 'utils/notificationUtils'

import { Update } from './types'

type Props = {
    level: 'ticket' | 'view'
    objectType: string
    ticketIds?: number[]
}

const useNotificationPayload = ({ level, objectType, ticketIds }: Props) => {
    const notification = useRef<{
        message: string
        id: string
    }>()

    const getNotificationParams = useCallback(
        (
            type: JobType,
            params?: {
                updates: XOR<Update>
            },
        ) => {
            const message = buildJobMessage(
                type,
                level === 'view',
                objectType,
                params || {},
                ticketIds?.length,
            )
            notification.current = {
                id: _uniqueId('notification-'),
                message,
            }
            return notification.current
        },
        [level, objectType, ticketIds?.length],
    )

    const getNotificationPayload = useCallback(
        ({
            id,
            message,
        }: { id?: string; message?: string } = {}): AlertNotification => {
            return {
                id: id ?? notification.current?.id,
                buttons: [],
                allowHTML: false,
                closeOnNext: true,
                dismissAfter: 10000,
                dismissible: true,
                message: message ?? notification.current?.message,
                position: POSITIONS.topCenter,
                status: NotificationStatus.Loading,
                style: NotificationStyle.Alert,
            }
        },
        [],
    )

    return {
        getNotificationParams,
        getNotificationPayload,
    }
}

export default useNotificationPayload
