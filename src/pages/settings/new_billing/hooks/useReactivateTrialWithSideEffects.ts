import {useQueryClient} from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {isGorgiasApiError} from 'models/api/types'
import {getBillingStateQuery, useReactivateTrial} from 'models/billing/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'

export const useReactivateTrialWithSideEffects = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useReactivateTrial({
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            void dispatch(
                notify({
                    message: 'Free trial has been successfully reactivated.',
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    noAutoDismiss: false,
                    allowHTML: true,
                })
            )
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            void dispatch(
                notify({
                    message: `Could not extend trial : ${msg}`,
                    status: NotificationStatus.Error,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    noAutoDismiss: false,
                    allowHTML: true,
                })
            )
        },
    })
}
