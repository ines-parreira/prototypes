import {useConfirmBillingPaymentMethodSetup} from '@gorgias/api-queries'
import {useQueryClient} from '@tanstack/react-query'
import {useStore} from 'react-redux'
import {billingKeys} from 'models/billing/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {getIsCurrentSubscriptionTrialingOrCanceled} from 'state/currentAccount/selectors'
import {ErrorResponse} from 'state/billing/types'
import {useStartSubscription} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useStartSubscription'

export const useConfirmBillingPaymentMethodSetupWithSideEffects = (
    overrides?: NonNullable<
        Parameters<typeof useConfirmBillingPaymentMethodSetup>['0']
    >['mutation']
) => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const store = useStore()

    const startSubscription = useStartSubscription()

    return useConfirmBillingPaymentMethodSetup({
        mutation: {
            ...overrides,
            onSuccess: (resp, ...args) => {
                void queryClient.invalidateQueries({
                    queryKey: billingKeys.creditCard(),
                })

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Credit card updated successfully!',
                        style: NotificationStyle.Alert,
                        showIcon: true,
                        showDismissButton: true,
                    })
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
                    'Failed to update credit card. Please try again in a few seconds.'
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
                        showIcon: true,
                        showDismissButton: true,
                    })
                )

                return overrides?.onError?.(err, ...args)
            },
        },
    })
}
