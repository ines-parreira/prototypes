import { useAsyncFn } from '@repo/hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import { updateSubscription } from 'state/currentAccount/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: String(error),
                    }),
                )
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
