import { useQueryClient } from '@tanstack/react-query'

import { queryKeys, useUpdatePaymentTerms } from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

export const useUpdatePaymentTermsWithSideEffects = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useUpdatePaymentTerms({
        mutation: {
            onSuccess: () => {
                const getPaymentTermsQueryKey =
                    queryKeys.billing.getPaymentTerms()
                void queryClient.invalidateQueries(getPaymentTermsQueryKey)
                void dispatch(
                    notify({
                        message:
                            'The payment terms have been successfully updated.',
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
                        message: `Could not update payment terms: ${msg}`,
                        status: NotificationStatus.Error,
                        style: NotificationStyle.Alert,
                        showDismissButton: true,
                        noAutoDismiss: false,
                        allowHTML: true,
                    }),
                )
            },
        },
    })
}
