import {useElements, useStripe} from '@stripe/react-stripe-js'
import {useMutation} from '@tanstack/react-query'
import {SetupIntentResult} from '@stripe/stripe-js'
import {MutationOverrides} from 'types/query'
import {useBillingContact} from 'models/billing/queries'

export const useConfirmStripeSetupIntent = (
    overrides?: MutationOverrides<() => Promise<SetupIntentResult>>
) => {
    const stripe = useStripe()
    const elements = useElements()

    const {data: {data: billingContact} = {}} = useBillingContact()

    const defaultBillingDetails = {
        ...billingContact?.shipping,
        email: billingContact?.email,
    }

    return useMutation({
        mutationFn: () =>
            stripe && elements
                ? stripe.confirmSetup({
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
                : Promise.reject('Stripe not initialized'),
        ...overrides,
    })
}
