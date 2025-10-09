import { useCallback, useMemo } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useTicketLegacyBridgeFunctions = () => {
    const dispatch = useAppDispatch()

    const dispatchNotification = useCallback(
        (config: { status: NotificationStatus; message: string }) =>
            dispatch(notify(config)),
        [dispatch],
    )

    return useMemo(
        () => ({
            dispatchNotification,
        }),
        [dispatchNotification],
    )
}
