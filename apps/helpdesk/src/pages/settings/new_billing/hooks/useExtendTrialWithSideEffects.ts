import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import { isGorgiasApiError } from 'models/api/types'
import { getBillingStateQuery, useExtendTrial } from 'models/billing/queries'

export const useExtendTrialWithSideEffects = () => {
    const queryClient = useQueryClient()

    return useExtendTrial({
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            toast.success('Free trial has been successfully extended.')
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            toast.error(`Could not extend trial : ${msg}`)
        },
    })
}
