import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'
import { errorToChildren } from 'utils'

export const createOnErrorHandler =
    (dispatch: StoreDispatch, defaultMessage: string) => (error: unknown) => {
        void dispatch(
            notify({
                title: isGorgiasApiError(error)
                    ? error.response?.data.error.msg
                    : defaultMessage,
                message: errorToChildren(error) || undefined,
                allowHTML: true,
                status: NotificationStatus.Error,
            }),
        )
    }
