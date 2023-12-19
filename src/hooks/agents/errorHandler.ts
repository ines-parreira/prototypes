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
        const msg = (
            error?.response?.data as {error: {msg: string}} | undefined
        )?.error?.msg
        if (msg) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: msg,
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
