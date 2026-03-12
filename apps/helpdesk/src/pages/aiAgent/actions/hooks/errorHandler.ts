import { isAxiosError } from 'axios'

import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'

export function handleError(
    error: unknown,
    defaultMsg: string,
    dispatch: StoreDispatch,
) {
    if (isAxiosError(error)) {
        if (error.response?.status === 409) {
            void dispatch(
                notify({
                    showDismissButton: true,
                    status: NotificationStatus.Error,
                    message:
                        'An Action with this name already exists. Choose a unique name in order to save.',
                }),
            )
            return undefined
        }

        const message = (
            error?.response?.data as { message: string } | undefined
        )?.message
        if (message) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: message,
                }),
            )
            return undefined
        }
    }
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message: defaultMsg,
        }),
    )
}
