import { renderHook } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'

import { useBillingStateWithSideEffects } from '../useBillingStateWithSideEffects'
import { useGetPaymentTermsWithSideEffects } from '../useGetPaymentTermsWithSideEffects'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

jest.mock('state/notifications/actions')

jest.mock('../useBillingStateWithSideEffects')
const useBillingStateWithSideEffectsMock =
    useBillingStateWithSideEffects as jest.Mock

describe('useGetPaymentTermsWithSideEffects', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return payment terms when data is available', () => {
        const mockBillingState = {
            customer: {
                payment_term_days: 30,
            },
        }

        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: mockBillingState,
            error: null,
            isLoading: false,
            isError: false,
            isRefetchError: false,
            isSuccess: true,
            status: 'success',
        })

        const { result } = renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(result.current.data).toBe(30)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.isSuccess).toBe(true)
    })

    it('should return undefined when payment terms are not available', () => {
        const mockBillingState = {
            customer: {
                // payment_term_days is missing
            },
        }

        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: mockBillingState,
            error: null,
            isLoading: false,
            isError: false,
            isRefetchError: false,
            isSuccess: true,
            status: 'success',
        })

        const { result } = renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(result.current.data).toBeUndefined()
        expect(result.current.isSuccess).toBe(true)
    })

    it('should return undefined when billing state is null', () => {
        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: null,
            error: null,
            isLoading: false,
            isError: false,
            isRefetchError: false,
            isSuccess: true,
            status: 'success',
        })

        const { result } = renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(result.current.data).toBeUndefined()
        expect(result.current.isSuccess).toBe(true)
    })

    it('should handle loading state', () => {
        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: true,
            isError: false,
            isRefetchError: false,
            isSuccess: false,
            status: 'pending',
        })

        const { result } = renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(false)
        expect(result.current.isSuccess).toBe(false)
    })

    it('should handle error state', () => {
        const myError = 'Unable to fetch payment terms'
        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: undefined,
            error: myError,
            isLoading: false,
            isError: true,
            isRefetchError: false,
            isSuccess: false,
            status: 'error',
        })

        const { result } = renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBe(myError)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(true)
        expect(result.current.isSuccess).toBe(false)
    })

    it('should handle refetch error state', () => {
        const myError = 'Refetch failed'
        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: undefined,
            error: myError,
            isLoading: false,
            isError: false,
            isRefetchError: true,
            isSuccess: false,
            status: 'error',
        })

        const { result } = renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBe(myError)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.isRefetchError).toBe(true)
        expect(result.current.isSuccess).toBe(false)
    })

    it('should pass overrides to useBillingStateWithSideEffects', () => {
        const overrides = {
            enabled: false,
            retry: 3,
        }

        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: null,
            error: null,
            isLoading: false,
            isError: false,
            isRefetchError: false,
            isSuccess: true,
            status: 'success',
        })

        renderHook(() => useGetPaymentTermsWithSideEffects(overrides))

        expect(useBillingStateWithSideEffectsMock).toHaveBeenCalledWith(
            overrides,
        )
    })

    it('should handle different payment term values', () => {
        const testCases = [
            { payment_term_days: 0, expected: 0 },
            { payment_term_days: 15, expected: 15 },
            { payment_term_days: 30, expected: 30 },
            { payment_term_days: 60, expected: 60 },
            { payment_term_days: 90, expected: 90 },
        ]

        testCases.forEach(({ payment_term_days, expected }) => {
            useBillingStateWithSideEffectsMock.mockReturnValue({
                data: {
                    customer: {
                        payment_term_days,
                    },
                },
                error: null,
                isLoading: false,
                isError: false,
                isRefetchError: false,
                isSuccess: true,
                status: 'success',
            })

            const { result } = renderHook(() =>
                useGetPaymentTermsWithSideEffects(),
            )

            expect(result.current.data).toBe(expected)
        })
    })

    it('should handle customer object being null', () => {
        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: {
                customer: null,
            },
            error: null,
            isLoading: false,
            isError: false,
            isRefetchError: false,
            isSuccess: true,
            status: 'success',
        })

        const { result } = renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(result.current.data).toBeUndefined()
        expect(result.current.isSuccess).toBe(true)
    })

    it('should handle customer object being undefined', () => {
        useBillingStateWithSideEffectsMock.mockReturnValue({
            data: {
                customer: undefined,
            },
            error: null,
            isLoading: false,
            isError: false,
            isRefetchError: false,
            isSuccess: true,
            status: 'success',
        })

        const { result } = renderHook(() => useGetPaymentTermsWithSideEffects())

        expect(result.current.data).toBeUndefined()
        expect(result.current.isSuccess).toBe(true)
    })
})
