import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import { isGorgiasApiError } from 'models/api/types'
import {
    getBillingStateQuery,
    useReactivateTrial,
} from 'models/billing/queries'

export const useReactivateTrialWithSideEffects = () => {
    const queryClient = useQueryClient()

    return useReactivateTrial({
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            toast.success('Free trial has been successfully reactivated.')
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            toast.error(`Could not extend trial : ${msg}`)
        },
    })
}
