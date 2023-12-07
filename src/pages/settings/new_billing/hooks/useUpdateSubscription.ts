// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'
import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'

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
                        message: error,
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
