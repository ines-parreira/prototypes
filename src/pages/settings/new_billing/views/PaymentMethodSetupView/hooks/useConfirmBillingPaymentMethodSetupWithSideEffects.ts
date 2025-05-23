import { useQueryClient } from '@tanstack/react-query'
import { useStore } from 'react-redux'

import { useConfirmBillingPaymentMethodSetup } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { getBillingStateQuery } from 'models/billing/queries'
import { useStartSubscription } from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useStartSubscription'
import { ErrorResponse } from 'state/billing/types'
import { getIsCurrentSubscriptionTrialingOrCanceled } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

export const useConfirmBillingPaymentMethodSetupWithSideEffects = (
    overrides?: NonNullable<
        Parameters<typeof useConfirmBillingPaymentMethodSetup>['0']
    >['mutation'],
) => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const store = useStore()

    const startSubscription = useStartSubscription()

    return useConfirmBillingPaymentMethodSetup({
        mutation: {
            ...overrides,
            onSuccess: (resp, ...args) => {
                void queryClient.invalidateQueries(getBillingStateQuery)

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Payment method updated successfully!',
                        style: NotificationStyle.Alert,
                        showDismissButton: true,
                    }),
                )

                const isStartingSubscription =
                    getIsCurrentSubscriptionTrialingOrCanceled(store.getState())

                return Promise.all([
                    isStartingSubscription ? startSubscription() : undefined,
                    overrides?.onSuccess?.(resp, ...args),
                ])
            },
            onError: (err, ...args) => {
                const error = err as ErrorResponse

                let errorMsg =
                    'Failed to update payment method. Please try again in a few seconds.'
                if (error.response && error.response.data?.error) {
                    // Gorgias API error
                    errorMsg = error.response.data.error.msg
                } else if (error.error && error.error.message) {
                    // Stripe API error
                    errorMsg = error.error.message
                }

                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: errorMsg,
                        style: NotificationStyle.Alert,
                        showDismissButton: true,
                    }),
                )

                return overrides?.onError?.(err, ...args)
            },
        },
    })
}
