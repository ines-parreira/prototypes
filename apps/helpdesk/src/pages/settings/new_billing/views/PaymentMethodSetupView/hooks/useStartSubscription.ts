import { useCallback } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useStore } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { GorgiasApi } from 'services/gorgiasApi'
import { setCurrentSubscription } from 'state/currentAccount/actions'
import { getIsCurrentSubscriptionTrialingOrCanceled } from 'state/currentAccount/selectors'

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
                toast.info(
                    'In order to activate your subscription, we need you to confirm this payment to your bank. ' +
                        'You will be redirected in a few seconds to a secure page.',
                    { duration: Duration.seconds(5) },
                )

                setTimeout(() => {
                    history.push(payment!.get('confirmation_url'))
                }, Duration.millis(4500))
            } else if (payment!.get('error')) {
                toast.error(
                    `${
                        payment!.get('error') as string
                    } Please update your payment method and retry to pay your invoice.`,
                )
            } else {
                toast.success('Your subscription has started!')
            }
        } catch (exception) {
            const error = exception as Record<string, unknown>
            const errorMsg = isGorgiasApiError(error)
                ? error.response.data.error.msg
                : 'Failed to update payment method. Please try again in a few seconds.'
            toast.error(errorMsg)
        }
    }, [dispatch, history, store])
}
