import type { AxiosError } from 'axios'

import { notify } from './notifications/actions'
import { NotificationStatus } from './notifications/types'
import type { StoreDispatch } from './types'

export const createErrorNotification = (error: unknown, reason: string) => ({
    type: 'ERROR',
    error,
    reason,
})

export const onApiError =
    (error: unknown, defaultMessage: string, action?: any) =>
    (dispatch: StoreDispatch) => {
        const message = (error as AxiosError<{ error?: { msg?: string } }>)
            ?.response?.data?.error?.msg

        action && dispatch(action)
        void dispatch(
            notify({
                status: NotificationStatus.Error,
                message: message || defaultMessage,
                allowHTML: true,
            }),
        )
    }
