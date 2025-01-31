import {useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useNotify = () => {
    const dispatch = useAppDispatch()

    return useMemo(() => {
        const notify = (config: {
            status: NotificationStatus
            message: string
        }) => dispatch(notifyAction(config))

        const success = (message: string) =>
            notify({status: NotificationStatus.Success, message})

        const error = (message: string) =>
            notify({status: NotificationStatus.Error, message})

        const info = (message: string) =>
            notify({status: NotificationStatus.Info, message})

        const warning = (message: string) =>
            notify({status: NotificationStatus.Warning, message})

        return {notify, success, error, info, warning}
    }, [dispatch])
}
