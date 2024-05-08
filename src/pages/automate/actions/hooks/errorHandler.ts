import axios from 'axios'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {StoreDispatch} from 'state/types'

export function handleError(
    error: unknown,
    defaultMsg: string,
    dispatch: StoreDispatch
) {
    if (axios.isAxiosError(error)) {
        const message = (error?.response?.data as {message: string} | undefined)
            ?.message
        if (message) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: message,
                })
            )
            return undefined
        }
    }
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message: defaultMsg,
        })
    )
}
