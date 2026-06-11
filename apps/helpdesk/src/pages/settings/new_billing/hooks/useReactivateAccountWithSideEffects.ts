import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import {
    getBillingStateQuery,
    useReactivateAccount,
} from 'models/billing/queries'
import { fetchAccount } from 'state/currentAccount/actions'

export const useReactivateAccountWithSideEffects = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useReactivateAccount({
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            void dispatch(fetchAccount())
            toast.success('Account has been successfully reactivated.')
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            toast.error(msg)
        },
    })
}
