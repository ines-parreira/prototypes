import {useElements, useStripe} from '@stripe/react-stripe-js'
import {SetupIntentResult, StripeError} from '@stripe/stripe-js'
import {useMutation} from '@tanstack/react-query'

import {CRM_GROWTH_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import {useBillingContact} from 'models/billing/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {MutationOverrides} from 'types/query'
import {reportError} from 'utils/errors'

export const useConfirmStripeSetupIntent = (
    overrides?: MutationOverrides<() => Promise<SetupIntentResult>>
) => {
    const dispatch = useAppDispatch()

    const stripe = useStripe()
    const elements = useElements()

    const {data: {data: billingContact} = {}} = useBillingContact({
        staleTime: Infinity,
    })

    const defaultBillingDetails = {
        ...billingContact?.shipping,
        email: billingContact?.email,
    }

    return useMutation({
        mutationFn: () => {
            if (!stripe || !elements) {
                throw new Error('Stripe is not initialized')
            }

            return stripe
                .confirmSetup({
                    elements,
                    redirect: 'if_required',
                    confirmParams: {
                        payment_method_data: {
                            // This data is overridden by the stripe elements data, see it as default values.
                            // It's used for the scenario where we don't require the user to re-enter the billing details.
                            billing_details: defaultBillingDetails,
                        },
                    },
                })
                .then((result) => {
                    // Stripe's confirmSetup always resolves with a SetupIntentResult, even if the setup intent is not successful.
                    // When the setup intent is not successful, the result object will have an error property.
                    if (result.error) {
                        if (result.error.setup_intent?.status === 'succeeded') {
                            // If the setup intent is successful, we don't want to treat it as an error.
                            return {setupIntent: result.error.setup_intent}
                        }

                        throw result.error
                    }
                    return result
                })
        },
        onError: (error, ...args) => {
            const stripeError = error as unknown as StripeError

            if (
                (stripeError.setup_intent?.status !== 'succeeded' &&
                    stripeError.code &&
                    ![
                        'card_declined',
                        'expired_card',
                        'incorrect_cvc',
                        'incorrect_number',
                    ].includes(stripeError.code)) ||
                !stripeError.code
            ) {
                // We only want to report errors that are not related to the user's input.
                handleError(error, 'Failed to confirm stripe setup intent')
            }

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: error.message as string,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                })
            )

            overrides?.onError?.(error, ...args)

            throw error
        },
        ...overrides,
    })
}

const handleError = (error: unknown, context: string) => {
    reportError(error, {
        tags: {team: CRM_GROWTH_SENTRY_TEAM},
        extra: {
            context,
        },
    })
}
