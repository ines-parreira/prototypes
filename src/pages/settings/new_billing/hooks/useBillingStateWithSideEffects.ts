import {useEffect} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {useBillingState} from 'models/billing/queries'
import {FETCH_BILLING_STATE_ERROR} from 'state/billing/constants'

export const useBillingStateWithSideEffects = (
    overrides?: Omit<
        Parameters<typeof useBillingState>['0'],
        'onSuccess' | 'onError' | 'onSettled'
    >
) => {
    const dispatch = useAppDispatch()

    const result = useBillingState(overrides)

    useEffect(() => {
        if (result.isError && result.error) {
            dispatch({
                type: FETCH_BILLING_STATE_ERROR,
                error: result.error,
                reason: 'Unable to fetch billing state.',
            })
        }
    }, [dispatch, result.error, result.isError])

    return result
}
