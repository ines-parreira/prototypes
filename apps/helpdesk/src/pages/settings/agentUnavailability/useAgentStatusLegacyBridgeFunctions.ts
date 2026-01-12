import { useCallback } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import type { NotificationStatus as AppNotificationStatus } from 'state/notifications/types'

export function useAgentStatusLegacyBridgeFunctions() {
    const dispatch = useAppDispatch()

    const dispatchNotification = useCallback(
        ({
            id,
            status,
            message,
            dismissAfter,
        }: {
            id?: string
            status: string
            message: string
            dismissAfter?: number
        }) => {
            dispatch(
                notify({
                    id,
                    status: status as AppNotificationStatus,
                    message,
                    dismissAfter,
                }),
            )
        },
        [dispatch],
    )

    return {
        dispatchNotification,
    }
}
