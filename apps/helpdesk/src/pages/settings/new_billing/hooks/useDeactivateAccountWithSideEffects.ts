import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import {
    getBillingStateQuery,
    useDeactivateAccount,
} from 'models/billing/queries'
import { fetchAccount } from 'state/currentAccount/actions'

export const useDeactivateAccountWithSideEffects = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useDeactivateAccount({
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            void dispatch(fetchAccount())
            toast.success(
                'Account has been successfully banned and deactivated.',
            )
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            toast.error(msg)
        },
    })
}
