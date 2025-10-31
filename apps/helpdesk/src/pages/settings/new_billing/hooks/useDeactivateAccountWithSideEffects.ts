import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import {
    getBillingStateQuery,
    useDeactivateAccount,
} from 'models/billing/queries'
import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

export const useDeactivateAccountWithSideEffects = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useDeactivateAccount({
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            void dispatch(
                notify({
                    message:
                        'Account has been successfully banned and deactivated.',
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    noAutoDismiss: false,
                    allowHTML: true,
                }),
            )
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            void dispatch(
                notify({
                    message: msg,
                    status: NotificationStatus.Error,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    noAutoDismiss: false,
                    allowHTML: true,
                }),
            )
        },
    })
}
