import { useQueryClient } from '@tanstack/react-query'
import { useStore } from 'react-redux'

import { toast } from '@gorgias/axiom'
import { useConfirmBillingPaymentMethodSetup } from '@gorgias/helpdesk-queries'

import { getBillingStateQuery } from 'models/billing/queries'
import { useStartSubscription } from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useStartSubscription'
import type { ErrorResponse } from 'state/billing/types'
import { getIsCurrentSubscriptionTrialingOrCanceled } from 'state/currentAccount/selectors'

export const useConfirmBillingPaymentMethodSetupWithSideEffects = (
    overrides?: NonNullable<
        Parameters<typeof useConfirmBillingPaymentMethodSetup>['0']
    >['mutation'],
) => {
    const queryClient = useQueryClient()
    const store = useStore()

    const startSubscription = useStartSubscription()

    return useConfirmBillingPaymentMethodSetup({
        mutation: {
            ...overrides,
            onSuccess: (resp, ...args) => {
                void queryClient.invalidateQueries(getBillingStateQuery)

                toast.success('Payment method updated successfully!')

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

                toast.error(errorMsg)

                return overrides?.onError?.(err, ...args)
            },
        },
    })
}
