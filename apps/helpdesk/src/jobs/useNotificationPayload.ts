import { useCallback, useRef } from 'react'
import { buildJobMessage } from '@repo/utils'
import _uniqueId from 'lodash/uniqueId'

import type { JobType } from '@gorgias/helpdesk-queries'

import type { Update } from './types'

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
        ({ id, message }: { id?: string; message?: string } = {}): {
            id?: string
            message?: string
        } => {
            return {
                id: id ?? notification.current?.id,
                message: message ?? notification.current?.message,
            }
        },
        [],
    )

    return {
        getNotificationParams,
        getNotificationPayload,
    }
}

export { useNotificationPayload }
