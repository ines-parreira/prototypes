import { useEffectOnce } from '@repo/hooks'
import { history } from '@repo/routing'
import { useLocation } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const NOTIF_TYPE_TO_STATUS: Record<string, NotificationStatus> = {
    error: NotificationStatus.Error,
    success: NotificationStatus.Success,
    warning: NotificationStatus.Warning,
    info: NotificationStatus.Info,
}

export function useUrlNotification() {
    const { search, pathname } = useLocation()
    const dispatch = useAppDispatch()

    useEffectOnce(() => {
        const params = new URLSearchParams(search)
        const notifType = params.get('notif_type')
        const rawNotifMsg = params.get('notif_msg')

        if (!notifType || !rawNotifMsg) {
            return
        }

        let message: string
        try {
            message = decodeURIComponent(rawNotifMsg.replace(/\+/g, '%20'))
        } catch {
            message = rawNotifMsg
        }

        const status =
            NOTIF_TYPE_TO_STATUS[notifType] ?? NotificationStatus.Info

        void dispatch(
            notify({
                message,
                status,
            }),
        )

        params.delete('notif_type')
        params.delete('notif_msg')
        const remainingParams = params.toString()
        history.replace({
            pathname,
            search: remainingParams ? `?${remainingParams}` : '',
        })
    })
}
