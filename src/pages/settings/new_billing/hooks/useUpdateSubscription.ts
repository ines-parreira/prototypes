import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAsyncFn from 'hooks/useAsyncFn'

export type HandleSubscriptionUpdate = {
    isLoading: boolean
    handleSubscriptionUpdate: (prices: string[]) => Promise<void>
}

export const useUpdateSubscription = (): HandleSubscriptionUpdate => {
    const dispatch = useAppDispatch()

    const [{loading}, handleSubscriptionUpdate] = useAsyncFn(
        async (prices: string[]) => {
            try {
                await dispatch(updateSubscription({prices}))
                return Promise.resolve()
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: String(error),
                    })
                )
                return Promise.reject(error)
            }
        },
        []
    )

    return {
        isLoading: loading,
        handleSubscriptionUpdate,
    }
}
