import { useEffect } from 'react'

import { useGetPaymentTerms } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { FETCH_BILLING_PAYMENT_TERMS_ERROR } from 'state/billing/constants'

export const useGetPaymentTermsWithSideEffects = (
    overrides?: Omit<
        Parameters<typeof useGetPaymentTerms>['0'],
        'onSuccess' | 'onError' | 'onSettled'
    >,
) => {
    const dispatch = useAppDispatch()

    const result = useGetPaymentTerms({
        ...overrides,
        query: {
            staleTime: 1 * 60 * 60 * 1000, // cache for 1 hour
            refetchOnWindowFocus: false,
        },
    })

    useEffect(() => {
        if (result.isError && result.error) {
            dispatch({
                type: FETCH_BILLING_PAYMENT_TERMS_ERROR,
                error: result.error,
                reason: 'Unable to fetch payment terms.',
            })
        }
    }, [dispatch, result.error, result.isError])

    return result
}
