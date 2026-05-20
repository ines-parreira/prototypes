import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import { queryKeys, useUpdatePaymentTerms } from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'

export const useUpdatePaymentTermsWithSideEffects = () => {
    const queryClient = useQueryClient()

    return useUpdatePaymentTerms({
        mutation: {
            onSuccess: () => {
                const billingStateQueryKey = queryKeys.billing.getBillingState()
                void queryClient.invalidateQueries(billingStateQueryKey)
                toast.success(
                    'The payment terms have been successfully updated.',
                )
            },
            onError: (error) => {
                const msg = isGorgiasApiError(error)
                    ? error.response?.data?.error?.msg
                    : 'Oops something went wrong'
                toast.error(`Could not update payment terms: ${msg}`)
            },
        },
    })
}
