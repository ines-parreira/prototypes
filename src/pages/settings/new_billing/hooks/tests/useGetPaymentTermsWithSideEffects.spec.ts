import { useGetPaymentTerms } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { FETCH_BILLING_PAYMENT_TERMS_ERROR } from 'state/billing/constants'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useGetPaymentTermsWithSideEffects } from '../useGetPaymentTermsWithSideEffects'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

jest.mock('state/notifications/actions')

jest.mock('@gorgias/helpdesk-queries')
const useGetPaymentTermsMock = assumeMock(useGetPaymentTerms)

describe('useGetPaymentTermsWithSideEffects', () => {
    it('should dispatch error notification on failure', () => {
        const myError = 'Unable to fetch payment terms'
        useGetPaymentTermsMock.mockReturnValue({
            data: undefined,
            error: myError,
            isLoading: false,
            isError: true,
            isRefetchError: false,
            isSuccess: false,
            status: 'error',
        } as unknown as ReturnType<typeof useGetPaymentTerms>)

        renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(dispatch).toHaveBeenNthCalledWith(1, {
            type: FETCH_BILLING_PAYMENT_TERMS_ERROR,
            error: myError,
            reason: 'Unable to fetch payment terms.',
        })
    })
})
