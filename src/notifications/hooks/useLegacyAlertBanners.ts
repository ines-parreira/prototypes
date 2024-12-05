import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    BannerNotification,
    isBannerNotification,
} from 'state/notifications/types'
import {RootState} from 'state/types'

function getNotifications(state: RootState) {
    return state.notifications
}

export default function useLegacyAlertBanners() {
    const notifications = useAppSelector(getNotifications)

    return useMemo(
        () =>
            notifications.filter((notification) =>
                isBannerNotification(notification)
            ) as BannerNotification[],
        [notifications]
    )
}
