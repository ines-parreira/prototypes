import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {RootState} from 'state/types'

function getNotifications(state: RootState) {
    return state.notifications
}

export default function useBannerNotifications() {
    const notifications = useAppSelector(getNotifications)

    return useMemo(
        () =>
            notifications.filter(
                (notification) => notification.style === 'banner'
            ),
        [notifications]
    )
}
