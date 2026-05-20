import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import { isGorgiasApiError } from 'models/api/types'
import { getBillingStateQuery, useSetIsVetted } from 'models/billing/queries'

export const useSetIsVettedWithSideEffects = () => {
    const queryClient = useQueryClient()

    return useSetIsVetted({
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            toast.success('Account has been successfully (un)vetted.')
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            toast.error(msg)
        },
    })
}
