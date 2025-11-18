import { useCallback } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import type { NotificationStatus } from 'state/notifications/types'

/**
 * Will need to be removed once the notification (toast) system is migrated to the Axiom
 * design system
 */
export function useLegacyDispatchNotification() {
    const dispatch = useAppDispatch()
    return useCallback(
        (config: { status: NotificationStatus; message: string }) =>
            dispatch(notify(config)),
        [dispatch],
    )
}
