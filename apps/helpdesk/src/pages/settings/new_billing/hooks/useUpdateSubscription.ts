import { useAsyncFn } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { updateSubscription } from 'state/currentAccount/actions'

export type HandleSubscriptionUpdate = {
    isLoading: boolean
    handleSubscriptionUpdate: (prices: string[]) => Promise<void>
}

export const useUpdateSubscription = ({
    onSuccess,
}: {
    onSuccess?: () => void
} = {}): HandleSubscriptionUpdate => {
    const dispatch = useAppDispatch()

    const [{ loading }, handleSubscriptionUpdate] = useAsyncFn(
        async (prices: string[]) => {
            try {
                await dispatch(updateSubscription({ prices }))
                onSuccess?.()
            } catch (error) {
                toast.error(String(error))
                throw error
            }
        },
        [],
    )

    return {
        isLoading: loading,
        handleSubscriptionUpdate,
    }
}
