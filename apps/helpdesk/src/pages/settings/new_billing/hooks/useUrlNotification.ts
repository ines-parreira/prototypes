import { useEffectOnce } from '@repo/hooks'
import { history } from '@repo/routing'
import { useLocation } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

const NOTIF_TYPE_TO_TOAST: Record<string, (msg: string) => void> = {
    error: toast.error,
    success: toast.success,
    warning: toast.warning,
    info: toast.info,
}

export function useUrlNotification() {
    const { search, pathname } = useLocation()

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

        const showToast = NOTIF_TYPE_TO_TOAST[notifType] ?? toast.info
        showToast(message)

        params.delete('notif_type')
        params.delete('notif_msg')
        const remainingParams = params.toString()
        history.replace({
            pathname,
            search: remainingParams ? `?${remainingParams}` : '',
        })
    })
}
