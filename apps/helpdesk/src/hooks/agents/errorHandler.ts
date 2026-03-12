import { isAxiosError } from 'axios'

import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'

export function handleError(
    error: unknown,
    defaultMsg: string,
    dispatch: StoreDispatch,
    title?: string,
) {
    if (isAxiosError(error)) {
        const msg = (
            error?.response?.data as { error: { msg: string } } | undefined
        )?.error?.msg
        if (msg) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: msg,
                }),
            )
            return undefined
        }
    }
    void dispatch(
        notify({
            ...(title && { title }),
            status: NotificationStatus.Error,
            message: defaultMsg,
            allowHTML: true,
        }),
    )
}
