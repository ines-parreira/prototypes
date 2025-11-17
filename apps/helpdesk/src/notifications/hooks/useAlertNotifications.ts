import { useMemo } from 'react'

import type { Notification as ReapopNotification } from 'reapop'

import useAppSelector from 'hooks/useAppSelector'
import { isAlertNotification } from 'state/notifications/types'
import type { RootState } from 'state/types'

function getNotifications(state: RootState) {
    return state.notifications
}

export default function useAlertNotifications() {
    const notifications = useAppSelector(getNotifications)

    return useMemo(
        () =>
            notifications.filter((notification) =>
                isAlertNotification(notification),
            ) as ReapopNotification[],
        [notifications],
    )
}
