import {UseQueryOptions} from '@tanstack/react-query'
import {useEffect} from 'react'
import {useCreditCard} from 'models/billing/queries'
import {
    FETCH_CREDIT_CARD_ERROR,
    FETCH_CREDIT_CARD_SUCCESS,
} from 'state/billing/constants'
import {getCreditCard} from 'models/billing/resources'
import useAppDispatch from 'hooks/useAppDispatch'

export const useCreditCardWithSideEffects = (
    overrides?: Omit<
        UseQueryOptions<Awaited<ReturnType<typeof getCreditCard>>>,
        'onSuccess' | 'onError' | 'onSettled'
    >
) => {
    const dispatch = useAppDispatch()

    const result = useCreditCard(overrides)

    useEffect(() => {
        if (result.isSuccess && result.data) {
            dispatch({
                type: FETCH_CREDIT_CARD_SUCCESS,
                resp: result.data,
            })
        }
    }, [dispatch, result.data, result.isSuccess])

    useEffect(() => {
        if (result.isError && result.error) {
            dispatch({
                type: FETCH_CREDIT_CARD_ERROR,
                error: result.error,
                reason: 'Unable to get credit card information.',
            })
        }
    }, [dispatch, result.error, result.isError])

    return result
}
