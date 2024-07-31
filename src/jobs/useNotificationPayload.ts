import {useMemo} from 'react'
import {JobType} from '@gorgias/api-queries'
import {POSITIONS} from 'reapop'

import useId from 'hooks/useId'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {buildJobMessage} from 'utils/notificationUtils'

import {Update} from './types'

type Props = {
    jobType: JobType
    level: 'ticket' | 'view'
    objectType: string
    params?: {
        updates: XOR<Update>
    }
    ticketIds?: number[]
}

const useNotificationPayload = ({
    jobType,
    level,
    objectType,
    params,
    ticketIds,
}: Props) => {
    const notificationId = 'notification-' + useId()
    const jobMessage = useMemo(
        () =>
            buildJobMessage(
                jobType,
                level === 'view',
                objectType,
                params || {},
                ticketIds?.length
            ),
        [jobType, level, objectType, params, ticketIds?.length]
    )
    const notificationPayload = useMemo(
        () => ({
            id: notificationId,
            buttons: [],
            allowHTML: false,
            closeButton: false,
            closeOnNext: true,
            dismissAfter: 10000,
            dismissible: true,
            message: jobMessage,
            position: POSITIONS.topCenter,
            status: NotificationStatus.Loading,
            style: NotificationStyle.Alert,
        }),
        [jobMessage, notificationId]
    )

    return notificationPayload
}

export default useNotificationPayload
