import {useCallback} from 'react'
import {useStore} from 'react-redux'
import {useHistory} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import {isGorgiasApiError} from 'models/api/types'
import GorgiasApi from 'services/gorgiasApi'
import {setCurrentSubscription} from 'state/currentAccount/actions'
import {getIsCurrentSubscriptionTrialingOrCanceled} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useStartSubscription = () => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const store = useStore()

    return useCallback(async () => {
        if (!getIsCurrentSubscriptionTrialingOrCanceled(store.getState())) {
            return
        }

        const gorgiasApi = new GorgiasApi()

        try {
            const response = await gorgiasApi.startSubscription()
            const subscription = response.get('subscription')
            dispatch(setCurrentSubscription(subscription))

            const payment: Map<any, any> | null = response.get('payment')
            if (payment!.get('confirmation_url')) {
                await dispatch(
                    notify({
                        status: NotificationStatus.Info,
                        message:
                            'In order to activate your subscription, we need you to confirm this payment to your bank. ' +
                            'You will be redirected in a few seconds to a secure page.',
                        dismissAfter: 5000,
                        dismissible: false,
                    })
                )

                setTimeout(() => {
                    history.push(payment!.get('confirmation_url'))
                }, 4500)
            } else if (payment!.get('error')) {
                void notify({
                    status: NotificationStatus.Error,
                    message: `${
                        payment!.get('error') as string
                    } Please update your payment method and retry to pay your invoice.`,
                })
            } else {
                await dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Your subscription has started!',
                    })
                )
            }
        } catch (exception) {
            const error = exception as Record<string, unknown>
            const errorMsg = isGorgiasApiError(error)
                ? error.response.data.error.msg
                : 'Failed to update payment method. Please try again in a few seconds.'
            await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: errorMsg,
                })
            )
        }
    }, [dispatch, history, store])
}
